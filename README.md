async-chainable-exec
====================
Plugin for [async-chainable](https://github.com/hash-bang/async-chainable) that adds external program execution.


	var asyncChainable = require('async-chainable');
	var asyncChainableExec = require('async-chainable-exec');

	asyncChainable()
		.use(asyncChainableExec)
		.exec('echo one two three')
		.end();


	asyncChainable()
		.use(asyncChainableExec)
		.exec('dirContents', ['ls', '-l', '-a'])
		.then(function(next) {
			console.log('The directory contains', this.dirContents);
			next();
		})
		.end(function(err) {
			if (err) throw new Error(err);
		});


	asyncChainable()
		.use(asyncChainableExec)
		.exec({
			id: 'myDir',
			cmd: 'bash',
			params: ['-c', 'echo $PWD'],
			cwd: __dirname,
		})
		.then(function(next) {
			console.log('My directory is', this.myDir);
			next();
		})
		.end(function(err) {
			if (err) throw new Error(err);
		});


	# Setting stdio=inherit will output to the console as the program runs
	asyncChainable()
		.use(asyncChainableExec)
		.execDefaults({stdio: 'inherit'})
		.exec(['find -type f'])
		.end(function(err) {
			if (err) throw new Error(err);
		});


	# Echo each command before it is executed
	asyncChainable()
		.use(asyncChainableExec)
		.execDefaults({
			log: function(cmd) { console.log('[RUN]', cmd.cmd + ' ' + cmd.params.join(' ')) }
			out: function(line) { console.log('[GOT]', line) }
		})
		.exec('echo foo')
		.exec('echo bar')
		.exec('echo baz')
		.end(function(err) {
			if (err) throw new Error(err);
		});


API
===
async-chainable-exec provides a single function, `exec()` which can be called a number of ways:

	exec(String <name>, Array <cmd + params>) // Execute the command + arguments array and store its response in 'name'
	exec(String <cmd + params>) // Execute command + arguments (response is still available in `this.exec`)
	exec(String <name>, String <cmd + params>) // Execute the command + arguments as a string and store its response in 'name'
	exec(Array <cmd + params>) // Execute the command + arguments array
	exec(Object) // Pass an object for execution, must contain at least 'cmd' but could contain 'params' as an array and 'id' as a string
	exec(String <name>, Array <cmd + params>, Object <additional>) // Execute command + arguments from the array using addition spawn arguments and store its response in 'name'
	exec(String <name>, Object) // Pass an object for execution (see 'Object' definition) and store its response in 'name'

Regardless of whether the exec function is called with a name / id the last executed item is stored in `this.exec` with the following properties:

| Key                                  | Type           |  Description                                                             |
|--------------------------------------|----------------|--------------------------------------------------------------------------|
| `this.exec.code`                     | Int            | The exit code of the last executed item                                  |
| `this.exec.output`                   | Array          | The combined STDOUT and STDERR streams from the last execution           |


Options
-------
In addition to the parameters supported by the generic `child_process.spawn()` method the following additional options are supported:

| Option                      | Type            | Description                                                                      |
|-----------------------------|-----------------|----------------------------------------------------------------------------------|
| `log`                       | function(cmd)   | Pass the command object (see above) to this function before every execution      |
| `out`                       | function(data)  | Pass the output of every command run as a string (both STDOUT and STDERR)        |
| `passthru`                  | boolean         | Also output STDOUT + STDERR into process.stdout / process.stderr. The `out` property cannot be set if this is true |
| `style`                     | string          | Use a predefined style (sets `log` + `out`). Currently supported: `batch`        |
