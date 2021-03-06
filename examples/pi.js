"use strict";
var ez = require('ez-streams');

var numberReader = function(n) {
    var i = 0;
    return ez.devices.generic.reader(function read(cb) {
        if (i < n) cb(null, i++);
        else cb();
    });
};

numberReader(10000).filter(function(cb, n) {
    cb(null, n % 2);
}).map(function(cb, n) {
    cb(null, n % 4 === 1 ? 1 / n : -1 / n);
}).reduce(function(err, result) {
	if (err) throw err;
    console.log("pi~=" + 4 * result);
}, function(cb, res, val) {
    cb(null, res + val);
}, 0);