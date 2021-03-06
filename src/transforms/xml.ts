"use strict";

/// !doc
/// 
/// # Simple XML parser and formatter
/// 
/// Transforms back and forth between XML and JS.
/// Tries to generate a JS object which is as simple as possible, without losing information.
/// 
/// Uses the following rules when converting from XML to JS:
/// * all values are returned as strings. No attempt to convert numbers and booleans
/// * attributes are mapped to a `$` subobject.
/// * simple values are mapped to an object with a `$value` property if the tag has attributes. 
/// * simple values are mapped to a string if the tag does not have attributes.
/// * repeating tags are mapped to an array.
/// * CDATA sections are mapped to an object with a `$cdata` property.
/// * self-closing tags are returned as an empty object.
/// 
/// Some examples:
/// 
/// ```
/// <a>hello world</a>  --> { a: "hello world" }
/// <a x="hello">world</a>  --> { a: { $: { x: "hello" }, $value: "world" } }
/// <a><b>hello</b><c>world</c></a>  --> { a: { b : "hello", c: "world" } }
/// <a><b>hello</b><b>world</b></a>  --> { a: { b : ["hello", "world"] }
/// <a></a>  --> { a: "" }
/// <a/>  --> { a: {} }
/// ```
/// 
/// See the `test/server/xml-test._js` unit test for more examples.
/// 
/// ## API
/// 
/// `import * as ez from 'ez-streams'`  
/// 
import { _ } from "streamline-runtime";
import { Reader } from "../reader";
import { Writer } from "../writer";

const begWord: any = {},
	inWord: any = {},
	space: any = {},
	LF = '\n'.charCodeAt(0),
	LT = '<'.charCodeAt(0),
	GT = '>'.charCodeAt(0),
	EXCLAM = '!'.charCodeAt(0),
	QMARK = '?'.charCodeAt(0),
	SLASH = '/'.charCodeAt(0),
	OBRA = '['.charCodeAt(0),
	EQ = '='.charCodeAt(0),
	DQUOTE = '"'.charCodeAt(0),
	DASH = '-'.charCodeAt(0),
	entitiesByChar: { [name: string]: string } = {
		'&': 'amp',
		'<': 'lt',
		'>': 'gt',
		'"': 'quot',
		"'": 'apos',
	},
	entitiesByName: { [name: string]: string } = {};

(() => {
	function add(clas: any, chs: string, i?: number) {
		chs.split('').forEach((ch) => {
			clas[ch.charCodeAt(0) + (i || 0)] = true;
		});
	}
	for (var i = 0; i <= 9; i++) add(inWord, '0', i);
	for (var i = 0; i < 26; i++) add(begWord, 'aA', i), add(inWord, 'aA', i);
	add(begWord, ':_'), add(inWord, ':_-.');
	add(space, ' \t\r\n');
	Object.keys(entitiesByChar).forEach((ch) => {
		entitiesByName[entitiesByChar[ch]] = ch;
	});
})();

function assert(cond: boolean, msg: string) {
	if (!cond) throw new Error(msg);
}

const MARKER = '689c93f7-0147-40e9-a172-5c6c1c12ba11';

/// * `transform = ez.transforms.xml.parser(options)`  
///   creates a parser transform. The following options can be set:  
///   - `tags`: the list of tags that enclose each item returned by the reader
export interface ParserOptions {
	tags?: string;
	encoding?: string;
}

interface Element {
	$tag?: string;
	$parent?: Element;
	$childCount?: number;
	$cdata?: string;
	$value?: string;
	$index?: number;
	$emit?: boolean;
	$?: { [name: string]: any };
	[name: string]: any;
}

export function parser(options?: ParserOptions) {
	const opts = options || {};
	const ttags: any = typeof opts === "string" ? opts : opts.tags;
	const tags = typeof ttags === "string" ? ttags.split('/') : ttags;
	if (!tags) throw new Error("cannot transform XML: 'tags' option missing")

	function builder(error: (message: string) => Error) {
		const root: Element = {
			$childCount: 0
		};
		var elt = root;

		function mustEmit(parent: Element, tag: string) {
			if (tag !== tags[tags.length - 1]) return false;
			// TS bugfix: for (var i = tags.length - 2; tag >= 0; tag--) {
			var p: Element | undefined = parent;
			for (var i = tags.length - 2; i >= 0; i--) {
				if (!p || p.$tag !== tags[i]) return false;
				p = p.$parent;
			}
			return true;
		}

		function clone(parent: Element, tag: string | undefined, child: Element): Element {
			const pp = Object.keys(parent).reduce((r: Element, k: string) => {
				if (k[0] !== '$' || k.length === 1) r[k] = tag === k ? child : parent[k];
				return r;
			}, {});
			return parent.$parent ? clone(parent.$parent, parent.$tag, pp) : pp;
		}

		return {
			push: (tag: string) => {
				if (elt.$cdata != null) throw error("cannot mix CDATA and children");
				if (elt.$value != null) throw error("cannot mix value and children");
				elt.$childCount++;
				const emit = mustEmit(elt, tag);
				const child: Element = {
					$tag: tag,
					$parent: elt,
					$childCount: 0,
					$emit: emit,
				};
				if (!emit && elt[tag] != null) {
					if (!Array.isArray(elt[tag])) elt[tag] = [elt[tag]];
					child.$index = elt[tag].length;
					elt[tag].push(child);
				} else {
					elt[tag] = child;
				}
				elt = child;
			},
			pop: (_: _, writer: Writer<any>, tag?: string) => {
				if (tag && tag !== elt.$tag) throw error("closing tag mismatch: expected " + elt.$tag + ", got " + tag);
				const parent = elt.$parent;
				const emit = elt.$emit;
				if (!parent) throw error("too many closing tags");
				delete elt.$parent;
				// if elt does not have attributes, replace it by value in parent
				if (elt.$value !== undefined && !elt.$) {
					if (emit || elt.$index === undefined) parent[elt.$tag!] = elt.$value;
					else parent[elt.$tag!][elt.$index] = elt.$value;
				} else {
					delete elt.$tag;
					delete elt.$childCount;
					delete elt.$index;
					delete elt.$emit;
				}
				if (emit) writer.write(_, clone(parent, tag, elt));
				elt = parent;
			},
			attribute: (atb: string, val: any) => {
				elt.$ = elt.$ || {};
				if (elt.$[atb] != null) throw error("duplicate attribute: " + atb);
				elt.$[atb] = val;
			},
			value: (val: any) => {
				if (elt.$cdata != null) throw error("cannot mix CDATA and value");
				if (elt.$childCount) throw error("cannot mix children and value");
				elt.$value = val;
			},
			cdata: (val: any) => {
				if (elt.$value != null) throw error("cannot mix value and CDATA");
				if (elt.$childCount) throw error("cannot mix children and CDATA");
				elt.$cdata = val;
			},
			getResult: () => {
				if (elt !== root) throw error("tag not closed: " + elt.$tag);
				if (!root.$childCount) throw error("root tag not found");
				if (root.$childCount !== 1) throw error("too many elements at top level");
				delete root.$childCount;
				return root;
			},
		};
	}
	return (_: _, reader: Reader<string | Buffer>, writer: Writer<any>) => {
		var data = reader.read(_);
		if (data === undefined) return;
		var str = Buffer.isBuffer(data) ? data.toString(opts.encoding || 'utf8') : data;
		var pos = 0,
			bld = builder(error);

		function forget() {
			str = str.substring(pos);
			pos = 0;
		}

		function fill(_: _, pat: string) {
			while (true) {
				var i = str.indexOf(pat, pos);
				// read at least 3 chars further to detect <!--
				if (i >= 0 && i < str.length - 3) return i;
				var rd = reader.read(_);
				if (rd === undefined) return i;
				str += rd;
			}
		}

		pos = fill(_, '<');
		if (pos < 0) throw new Error("invalid XML: starting < not found");
		if (!/^\s*$/.test(str.substring(0, pos))) throw new Error("invalid XML: does not start with <");

		function error(msg: string) {
			var m = str.substring(pos).match(/[\n\>]/);
			var end = m ? pos + m.index + 1 : str.length;
			const line = str.substring(0, pos).split('\n').length;
			return new Error("Invalid XML: " + msg + " at line " + line + " near " + str.substring(pos, end));
		}

		function eatSpaces() {
			while (space[ch = str.charCodeAt(pos)]) pos++;
		}

		function eat(ch: number) {
			if (str.charCodeAt(pos) !== ch) throw error("expected '" + String.fromCharCode(ch) + "', got '" + str[pos] + "'");
			pos++;
		}

		function clean(str: string) {
			return str.replace(/&([^;]+);/g, (s, ent) => {
				const ch = entitiesByName[ent];
				if (ch) return ch;
				if (ent[0] != '#') throw error("invalid entity: &" + ent + ";");
				ent = ent.substring(1);
				if (ent[0] === 'x') ent = ent.substring(1);
				const v = parseInt(ent, 16);
				if (isNaN(v)) throw error("hex value expected, got " + ent);
				return String.fromCharCode(v);
			});
		}

		function checkEmpty(str: string) {
			if (str.match(/[^ \t\r\n]/)) throw error("unexpected value: " + str);
		}

		do {
			eat(LT);
			forget();
			var npos = fill(_, '<');

			var beg = pos;
			var ch = str.charCodeAt(pos++);
			if (begWord[ch]) {
				// opening tag
				// read tag name
				while (inWord[str.charCodeAt(pos)]) pos++;
				bld.push(str.substring(beg, pos));
				// read attributes till >
				while (true) {
					eatSpaces();
					beg = pos;
					ch = str.charCodeAt(pos++);
					if (ch === SLASH) {
						eat(GT);
						bld.pop(_, writer);
						break;
					} else if (begWord[ch]) {
						while (inWord[str.charCodeAt(pos)]) pos++;
						var atb = str.substring(beg, pos);
						eatSpaces();
						eat(EQ);
						eatSpaces();
						eat(DQUOTE);
						beg = pos;
						pos = str.indexOf('"', pos);
						if (pos < 0) throw error("double quote missing");
						bld.attribute(atb, clean(str.substring(beg, pos)));
						pos++;
					} else if (ch === GT) {
						var val = "";
						while (true) {
							var j = str.indexOf('<', pos);
							if (j < 0) throw error("tag not closed");
							if (str.charCodeAt(j + 1) === EXCLAM && str.substring(j + 2, j + 4) == '--') {
								val += clean(str.substring(pos, j));
								pos = j + 4;
								j = fill(_, '-->');
								if (j < 0) throw error("unterminated comment");
								pos = j + 3;
								fill(_, '<');
							} else {
								break;
							}
						}
						val += clean(str.substring(pos, j));
						if (str.charCodeAt(j + 1) === SLASH) bld.value(val), pos = j;
						else checkEmpty(val);
						break;
					} else {
						pos--;
						throw error("unexpected character: '" + str[pos] + "'");
					}
				}
			} else if (ch === SLASH) {
				// closing tag - read optional tag name
				beg = pos;
				var ch = str.charCodeAt(pos);
				var tag: string | undefined;
				if (begWord[ch]) {
					pos++;
					while (inWord[str.charCodeAt(pos)]) pos++;
					tag = str.substring(beg, pos);
				}
				eatSpaces();
				eat(GT);
				bld.pop(_, writer, tag);
			} else if (ch === EXCLAM) {
				// comment
				var ch = str.charCodeAt(pos++);
				if (ch === DASH && str.charCodeAt(pos++) === DASH) {
					var j = str.indexOf('-->', pos);
					if (j < 0) throw error("--> missing");
					pos = j + 3;
				} else if (ch === OBRA && str.substring(pos, pos + 6) === 'CDATA[') {
					pos += 6;
					var j = fill(_, ']]>');
					if (j < 0) throw error("]]> missing");
					bld.cdata(str.substring(pos, j));
					pos = j + 3;
					eatSpaces();
				} else {
					throw error("invalid syntax after <!");
				}
			} else if (ch === QMARK) {
				// processing instruction
				var j = str.indexOf('?>', pos);
				if (j < 0) throw error("?> missing");
				pos = j + 2;
			} else {
				throw error("unexpected character: " + str[beg]);
			}
			eatSpaces();
		} while (npos >= 0);
		if (pos != str.length) throw error("unexpected trailing text: " + str.substring(pos));
	};
}
/// * `transform = ez.transforms.xml.formatter(options)`  
///   creates a formatter transform. The following options can be set:  
///   - `tags`: the list of tags that enclose each item returned by the reader
///   - `indent`: optional indentation string, should only contain spaces.
export interface FormatterOptions {
	tags?: string;
	indent?: string;
}

export interface Builder {
	beginTag: (tag: string) => void;
	addAttribute: (atb: string, val: any) => void;
	endTag: (close?: boolean) => void;
	closeTag: (tag: string, val?: any) => void;
	cdata: (data: string) => void;
	getResult: (extraIndent?: boolean) => string;
}

export function formatter(options?: FormatterOptions) {
	const opts = options || {};
	const ttags: any = typeof opts === "string" ? opts : opts.tags;
	const tags = typeof ttags === "string" ? ttags.split('/') : ttags;
	if (!tags) throw new Error("cannot transform XML: 'tags' option missing")
	const ident = opts && opts.indent;

	function builder(depth: number): Builder {
		var str = '';

		function indent() {
			str += '\n' + Array(depth + 1).join(opts.indent);
		}

		function escape(val: any) {
			return typeof (val) !== "string" ? "" + val : val.replace(/([&<>"']|[^ -~\u00a1-\ud7ff\ue000-\ufffd])/g, (ch: string) => {
				const ent = entitiesByChar[ch];
				if (ent) return '&' + ent + ';';
				var hex = ch.charCodeAt(0).toString(16);
				while (hex.length < 2) hex = '0' + hex;
				while (hex.length > 2 && hex.length < 4) hex = '0' + hex;
				return '&#x' + hex + ';';
			});
		}
		return {
			beginTag: (tag) => {
				opts.indent && indent();
				str += '<' + tag;
				depth++;
			},
			addAttribute: (atb, val) => {
				str += ' ' + atb + '="' + escape(val) + '"';
			},
			endTag: (close) => {
				close && depth--;
				str += close ? '/>' : '>';
			},
			closeTag: (tag, val) => {
				depth--;
				if (val != null) {
					str += escape(val);
				} else {
					opts.indent && indent();
				}
				str += '</' + tag + '>';
			},
			cdata: (data) => {
				str += '<![CDATA[' + data + ']]>';
			},
			getResult: (extraIndent) => {
				if (extraIndent) indent();
				// indexOf to eliminate newline that indent may put before root
				return str.substring(str.indexOf('<'));
			}
		};
	}

	return (_: _, reader: Reader<any>, writer: Writer<string>) => {
		function error(msg: string) {
			return new Error(msg);
		}

		function strfy(bld: Builder, elt: any, tag: string) {
			if (elt === undefined) return bld;
			if (Array.isArray(elt)) {
				elt.forEach((child: any) => {
					strfy(bld, child, tag);
				});
				return bld;
			}
			bld.beginTag(tag);
			if (elt === null) {
				bld.addAttribute('xsi:nil', 'true');
				bld.endTag(true);
			} else if (typeof elt !== "object") {
				bld.endTag();
				bld.closeTag(tag, elt);
			} else {
				if (elt.$) {
					Object.keys(elt.$).forEach((atb) => {
						var v: any;
						if ((v = elt.$[atb]) != null) bld.addAttribute(atb, v);
					});
				}
				const keys = Object.keys(elt).filter((key) => key[0] !== '$');
				if (elt.$value !== undefined) {
					if (keys.length > 0) throw error("cannot mix $value and $children");
					if (elt.$cdata) throw error("cannot mix $value and $cdata");
					if (elt.$value === null) {
						bld.addAttribute('xsi:nil', 'true');
						bld.endTag(true);
					} else {
						bld.endTag();
						bld.closeTag(tag, elt.$value);
					}
				} else if (elt.$cdata != null) {
					if (keys.length > 0) throw error("cannot mix $cdata and $children");
					bld.endTag();
					bld.cdata(elt.$cdata);
					bld.closeTag(tag);
				} else if (keys.length > 0) {
					bld.endTag();
					keys.forEach((key) => {
						strfy(bld, elt[key], key);
					});
					bld.closeTag(tag);
				} else {
					bld.endTag(true);
				}
			}
			return bld;
		}
		function getParent(elt: any) {
			for (var i = 0; i < tags.length - 1; i++) {
				elt = elt[tags[i]];
				if (elt === null) throw new Error("tag not found: " + tags[i]);
			}
			return elt;
		}

		const rootTag = tags[0];
		const parentTag = tags[tags.length - 1];

		const elt = reader.read(_);
		if (elt === undefined) return;
		var parent = getParent(elt);
		const saved = parent[parentTag];
		parent[parentTag] = MARKER;
		const envelope = strfy(builder(0), elt[rootTag], rootTag).getResult();
		parent[parentTag] = saved;

		const marker = '<' + parentTag + '>' + MARKER + '</' + parentTag + '>';
		const markerPos = envelope.indexOf(marker);
		if (markerPos < 0) throw new Error("internal error: marker not found");

		const prologue = '<?xml version="1.0"?>' + (opts.indent ? '\n' : '');
		writer.write(_, prologue + envelope.substring(0, markerPos));
		while (true) {
			var xml = strfy(builder(tags.length - 1), parent[parentTag], parentTag).getResult(true);
			writer.write(_, xml);
			var parent = reader.read(_);
			if (parent === undefined) break;
			parent = getParent(parent);
		}
		writer.write(_, envelope.substring(markerPos + marker.length));
	};
}