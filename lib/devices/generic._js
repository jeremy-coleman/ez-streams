"use strict";

var empty = {
	reader: require('../reader').decorate({
		read: function(_) {},
	}),
	writer: require('../writer').decorate({
		write: function(_, value) {},
	}),
};

module.exports = {
	/// !doc
	/// ## Generic stream constructors
	/// 
	/// `var ez = require('ez-streams');`
	/// 
	/// * `reader = ez.devices.generic.reader(read)`  
	///   creates an EZ reader from a given `read(_)` function.
	reader: function(read) {
		return Object.create(empty.reader, {
			read: {
				value: read
			},
		});
	},

	/// * `writer = ez.devices.generic.writer(write)`  
	///   creates an ES writer from a given `write(_, val)` function.
	writer: function(write) {
		return Object.create(empty.writer, {
			write: {
				value: write
			},
		});
	},

	/// ## Special streams
	/// 
	/// * `ez.devices.generic.empty`  
	///   The empty stream. `empty.read(_)` returns `undefined`.
	///   It is also a null sink. It just discards anything you would write to it.
	empty: empty,
};