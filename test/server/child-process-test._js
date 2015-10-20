"use strict";
QUnit.module(module.id);
var cp = require('child_process');
var ez = require('../..');
var fsp = require('path');
var os = require('os');

asyncTest("echo ok", 1, function(_) {
    if (os.type() === 'Windows_NT') {
        ok("Ignore on Windows");
    } else {
        var proc = cp.spawn('echo', ['hello\nworld']);
        var got = ez.devices.child_process.reader(proc).toArray(_);
        deepEqual(got, ['hello', 'world']);
    }
	start();
});

asyncTest("bad command", 1, function(_) {
	var proc = cp.spawn(fsp.join(__dirname, 'foobar.zoo'), ['2']);
	try {
		var got = ez.devices.child_process.reader(proc).toArray(_);
		ok(false);
	} catch (ex) {
		ok(ex.code < 0); // -1 on node 0.10 but -2 on 0.12
	}
	start();
});

asyncTest("exit 2", 1, function(_) {
	var cmd = 'exit2' + (os.type() === 'Windows_NT' ? '.cmd' : '.sh');
	var proc = cp.spawn(fsp.join(__dirname, '../fixtures', cmd), ['2']);
	try {
		var got = ez.devices.child_process.reader(proc).toArray(_);
		ok(false);
	} catch (ex) {
		equal(ex.code, 2);
	}
	start();
});