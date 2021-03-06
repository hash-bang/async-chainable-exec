var expect = require('chai').expect;
var asyncChainable = require('async-chainable');
var asyncChainableExec = require('../index');


describe('exec(name, [cmd + params])', function() {
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.exec('execOutput', ['echo', 'foo', 'bar', 'baz'])
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.execOutput;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal('foo bar baz');
	});
});


describe('exec(cmd + params)', function(){
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.exec('echo w00t')
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.exec.output;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal('w00t');
	});
});


describe('exec(name, cmd)', function(){
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.exec('response', 'echo hello world')
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.response;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal('hello world');
	});
});


describe('exec([cmd + params])', function() {
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.exec(['echo', 'green', 'eggs', 'and', 'ham'])
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.exec.output;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal('green eggs and ham');
	});
});


describe('exec(cmdObject)', function(){
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.exec({
				id: 'noises',
				cmd: 'echo',
				params: ['crash', 'bang', 'boom'],
				cwd: __dirname,
			})
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.noises;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal('crash bang boom');
	});
});


describe('exec(name, [cmd + params], additional)', function(){
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.exec('bash2', ['bash', '-c', 'echo My directory is $PWD'],  {cwd: __dirname})
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.bash2;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal('My directory is ' + __dirname);
	});
});

describe('exec(name, cmdObject)', function(){
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.exec('output', {
				cmd: 'bash',
				params: ['-c', 'echo $PWD'],
				cwd: __dirname,
			})
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.output;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal(__dirname);
	});
});


describe('exec(cmd + params) with log', function(){
	var output;

	beforeEach(function(done) {
		output = '';

		asyncChainable()
			.use(asyncChainableExec)
			.execDefaults({
				log: function(cmd) { console.log('[RUN]', cmd.cmd + ' ' + cmd.params.join(' ')) },
				out: function(data) { console.log('[OUT]', data) }
			})
			.exec('echo foo')
			.exec('echo bar')
			.exec('echo baz')
			.end(function(err) {
				expect(err).to.be.not.ok;
				output = this.exec.output;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(1);
		expect(output[0]).to.be.equal('baz');
	});
});


describe('stdout hook', function(){
	var output;

	beforeEach(function(done) {
		output = [];

		asyncChainable()
			.use(asyncChainableExec)
			.execDefaults({
				stdout: function(data) { output.push(data.split('\n')[0]) },
			})
			.exec(['node', '-e','process.stdout.write("foo")'])
			.exec(['node', '-e','process.stdout.write("bar")'])
			.exec(['node', '-e','process.stdout.write("baz")'])
			.end(function(err) {
				expect(err).to.be.not.ok;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(3);
		expect(output[0]).to.be.equal('foo');
		expect(output[1]).to.be.equal('bar');
		expect(output[2]).to.be.equal('baz');
	});
});


describe('stderr hook', function(){
	var output;

	beforeEach(function(done) {
		output = [];

		asyncChainable()
			.use(asyncChainableExec)
			.execDefaults({
				stderr: function(data) { output.push(data.split('\n')[0]) },
			})
			.exec(['node', '-e','process.stderr.write("foo")'])
			.exec(['node', '-e','process.stderr.write("bar")'])
			.exec(['node', '-e','process.stderr.write("baz")'])
			.end(function(err) {
				expect(err).to.be.not.ok;
				done();
			});

	});

	it('should return the correct response', function() {
		expect(output).to.have.length(3);
		expect(output[0]).to.be.equal('foo');
		expect(output[1]).to.be.equal('bar');
		expect(output[2]).to.be.equal('baz');
	});
});
