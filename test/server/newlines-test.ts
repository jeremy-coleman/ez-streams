/// <reference path="../../node_modules/retyped-qunit-tsd-ambient/qunit.d.ts" />
declare function asyncTest(name: string, expected: number, test: (_: _) => any): any;

import { _ } from "streamline-runtime";
import * as ez from "../..";

QUnit.module(module.id);
const lines = ez.transforms.lines;
const file = ez.devices.file;

const inputFile = require('os').tmpdir() + '/jsonInput.json';
const outputFile = require('os').tmpdir() + '/jsonOutput.json';
const fs = require('fs');
const string = ez.devices.string;

function nodeStream(_: _, text: string) {
	fs.writeFile(inputFile, text, "utf8", _);
	return file.text.reader(inputFile);
}

asyncTest("empty", 1, (_) => {
	const stream = nodeStream(_, '').transform(lines.parser());
	strictEqual(stream.read(_), undefined, "undefined");
	start();
});

asyncTest("non empty line", 2, (_) => {
	const stream = nodeStream(_, 'a').transform(lines.parser());
	strictEqual(stream.read(_), 'a', "a");
	strictEqual(stream.read(_), undefined, "undefined");
	start();
});

asyncTest("only newline", 2, (_) => {
	const stream = nodeStream(_, '\n').transform(lines.parser());
	strictEqual(stream.read(_), '', "empty line");
	strictEqual(stream.read(_), undefined, "undefined");
	start();
});

asyncTest("mixed", 5, (_) => {
	const stream = nodeStream(_, 'abc\n\ndef\nghi').transform(lines.parser());
	strictEqual(stream.read(_), 'abc', 'abc');
	strictEqual(stream.read(_), '', "empty line");
	strictEqual(stream.read(_), 'def', 'def');
	strictEqual(stream.read(_), 'ghi', 'ghi');
	strictEqual(stream.read(_), undefined, "undefined");
	start();
});

asyncTest("roundtrip", 1, (_) => {
	const writer = string.writer();
	const text = 'abc\n\ndef\nghi';
	string.reader(text, 2).transform(lines.parser()).transform(lines.formatter()).pipe(_, writer);
	strictEqual(writer.toString(), text, text);
	start();
});

asyncTest("binary input", 1, (_) => {
	const writer = string.writer();
	const text = 'abc\n\ndef\nghi';
	ez.devices.buffer.reader(new Buffer(text, 'utf8')).transform(lines.parser()).transform(lines.formatter()).pipe(_, writer);
	strictEqual(writer.toString(), text, text);
	start();
});
