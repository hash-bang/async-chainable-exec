var argy = require('argy');
var colors = require('chalk');
var clone = require('clone');
var spawnArgs = require('spawn-args');
var spawn = require('child_process').spawn;

module.exports = function() {
	// .exec() {{{
	this._plugins['exec'] = function(params) {
		var self = this;
		var stdboth = [];

		// Read in params from _execDefaults + params {{{
		var options = clone(this._execDefaults);
		if (params)
			for (var k in params)
				options[k] = params[k];
		// }}}

		if (options.style) // Pre-set styles
			switch (options.style) {
				case 'batch': // Add colorful prefixs to commands when they run and their output
					options.log = function(cmd) {
						console.log(colors.blue('[RUN]'), cmd.cmd + ' ' + cmd.params.join(' '));
					};
					options.out = function(data) {
						console.log(colors.grey('---->'), data);
					};
					break;
				case 'passthru': // Pass though all input
					options.stdio = 'inherit';
					break;
				default:
					throw new Error('Unknown async-chainable-exec style: ' + options.style);
			}

		if (options.log) options.log.call(this, params);
		if (options.passthru) options.stdio = 'inherit';

		var spawner = spawn(params.cmd, params.params, options);

		var dataListener = function(data) {
			var out = data.toString();
			if (options.out) options.out.call(this, data.toString().replace(/\n$/, ''));
			stdboth.push(out.replace(/\n$/, ''));
		};

		if (spawner.stdout) spawner.stdout.on('data', dataListener);
		if (spawner.stderr) spawner.stderr.on('data', dataListener);

		if (options.stdout) spawner.stdout.on('data', function(data) { options.stdout(data.toString()) });
		if (options.stderr) spawner.stderr.on('data', function(data) { options.stderr(data.toString()) });

		spawner.on('close', function(code) {
			self._context.exec = { // Save details about the last exec in case any future chain wants them
				code: code,
				output: stdboth,
			};
			if (params.id) // Stash output in variable
				self._context[params.id] = stdboth;
			self._execute(); // Move onto next chain item
		});
	};

	this.exec = function() {
		var chain = this;
		argy(arguments)
			.ifForm('', function() {})
			.ifForm('string array', function(id, block) {
				chain._struct.push({
					type: 'exec',
					id: id,
					cmd: block[0],
					params: block.slice(1),
				});
			})
			.ifForm('string', function(cmd) {
				chain._struct.push({
					type: 'exec',
					cmd: cmd.substr(0, cmd.indexOf(' ')),
					params: spawnArgs(cmd.substr(cmd.indexOf(' ') + 1)),
				});
			})
			.ifForm('string string', function(id, cmd) {
				chain._struct.push({
					type: 'exec',
					id: id,
					cmd: cmd.substr(0, cmd.indexOf(' ')),
					params: spawnArgs(cmd.substr(cmd.indexOf(' ') + 1)),
				});
			})
			.ifForm('array', function(block) {
				chain._struct.push({
					type: 'exec',
					cmd: block[0],
					params: block.slice(1),
				});
			})
			.ifForm('array object', function(block, options) {
				var payload = {
					type: 'exec',
					cmd: block[0],
					params: block.slice(1),
				};
				for (var key in options)
					payload[key] = options[key];
				chain._struct.push(payload);
			})
			.ifForm('object', function(options) {
				if (!options.cmd) throw new Error('No "cmd" key in passed object to async-chainable-exec');
				if (!options.params) options.params = [];
				options.type = 'exec';
				chain._struct.push(options);
			})
			.ifForm('string array object', function(id, block, options) {
				var payload = {
					type: 'exec',
					id: id,
					cmd: block[0],
					params: block.slice(1),
				};
				for (var key in options)
					payload[key] = options[key];
				chain._struct.push(payload);
			})
			.ifForm('string object', function(id, options) {
				if (!options.cmd) throw new Error('No "cmd" key in passed object to async-chainable-exec');
				var payload = {
					type: 'exec',
					id: id,
				};
				for (var key in options)
					payload[key] = options[key];
				chain._struct.push(payload);
			})
			.ifFormElse(function(form) {
				throw new Error('Unsupported call type for async-chainable-exec: ' + form);
			});

		return chain;
	};
	// }}}

	// .execDefaults {{{
	this._execDefaults = {};

	this._plugins['execDefaults'] = function(params) {
		this._execDefaults = params.payload;
		this._execute(); // Move onto next chain item
	};

	this.execDefaults = function() {
		var chain = this;

		argy(arguments)
			.ifForm('', function() {})
			.ifForm('object', function(options) {
				chain._struct.push({
					type: 'execDefaults',
					payload: options,
				});
			})
			.ifFormElse(function(form) {
				throw new Error('Unsupported call type for async-chainable-exec#execDefaults: ' + form);
			});

		return chain;
	};
	// }}}
};
