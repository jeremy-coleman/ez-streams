"use strict";

const generic = require('./generic');
const stopException = require('../stop-exception');
const nextTick = require('../util').nextTick;

var lastId = 0;
var tracer; // = console.error;

module.exports = {
	/// !doc
	/// ## Special device that transforms a writer into a reader
	/// 
	/// `const ez = require('ez-streams');`
	/// 
	/// * `uturn = ez.devices.uturn.create()`  
	///   creates a uturn device.  
	///   The device has two properties: a `uturn.writer` to which you can write,   
	///   and a `uturn.reader` from which you can read.  
	create: function() {
		var state = 'idle', pendingData, pendingCb, error;
		const id = ++lastId;

		function bounce(err, val) {
			const lcb = pendingCb;
			pendingCb = null;
			if (lcb) lcb(err, val);
		}

		return {
			reader: generic.reader(function read(cb) {
				nextTick(() => {
					tracer && tracer(id, "READ", state, pendingData);
					const st = state;
					switch (st) {
						case 'writing':
							state = pendingData === undefined ? 'done' : 'idle';
							// acknowledge the write
							bounce();
							// return the data posted by the write
							cb(null, pendingData);
							pendingData = null;
							break;
						case 'idle':
							// remember it
							state = 'reading';
							pendingCb = cb;
							break;
						case 'readStopping':
						case 'writeStopping':
							state = 'done';
							const arg = stopException.unwrap(error);
							// acknowledge the stop
							bounce();
							// return undefined or throw
							cb(arg && arg !== true ? arg : null);
							break;
						case 'done':
							cb(error);
							break;
						default:
							state = 'done';
							cb(error || new Error('invalid state ' + st));
							break;
					}
				});
			}, function stop(cb, arg) {
				nextTick(() => {
					error = error || stopException.make(arg);
					tracer && tracer(id, "STOP READER", state, arg);
					const st = state;
					switch (st) {
						case 'reading':
							state = 'done';
							// send undefined or exception to read
							bounce(arg && arg !== 1 ? arg : null);
							// acknowledge the stop
							cb();
							break;
						case 'writing':
							state = 'done';
							// send to write
							bounce(error);
							// acknowledge the stop
							cb();
							break;
						case 'idle':
							// remember it
							state = 'readStopping';
							pendingCb = cb;
							break;
						case 'done':
							cb(error);
							break;
						default:
							state = 'done';
							cb(error || new Error('invalid state ' + st));
							break;
					}
				});
			}),
			writer: generic.writer(function write(cb, data) {
				nextTick(() => {
					tracer && tracer(id, "WRITE", state, data);
					const st = state;
					switch (st) {
						case 'reading':
							state = data === undefined ? 'done' : 'idle';
							// acknowledge the read
							bounce(error, data);
							// return the data posted by the write
							cb();
							break;
						case 'idle':
							// remember it
							state = 'writing';
							pendingCb = cb;
							pendingData = data;
							break;
						case 'readStopping':
							state = 'done';
							// acknowledge the stop
							bounce();
							// throw the error
							cb(error);
							break;
						case 'done':
							cb(error || 'invalid state ' + st);
							break;
						default:
							state = 'done';
							cb(new Error('invalid state ' + st));
							break;
					}
				});
			}, function stop(cb, arg) {
				nextTick(() => {
					tracer && tracer(id, "STOP WRITER", state, arg);
					error = error || stopException.make(arg);
					const st = state;
					switch (st) {
						case 'reading':
							// send undefined or exception to read
							state = 'done';
							bounce(arg && arg !== 1 ? arg : null);
							// acknowledge the stop
							cb();
							break;
						case 'idle':
							// remember it
							state = 'writeStopping';
							pendingCb = cb;
							break;
						case 'done':
							cb(error);
							break;
						default:
							state = 'done';
							cb(new Error('invalid state ' + st));
							break;
					}
				});
			}),
			end: function(err) {
				nextTick(() => {
					tracer && tracer(id, "END", state, err);
					err = stopException.unwrap(err);
					error = error || err;
					state = 'done';
					bounce(error);
				});
			},
		};
	},
};