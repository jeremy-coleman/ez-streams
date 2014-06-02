"use strict";
/// !doc
/// Stream transform for simple JSON streams
/// 
/// ## "Simple" JSON streams
/// 
/// A _simple JSON stream_ is a text stream with the following format:
/// 
/// * the stream starts with `[` and ends with `]`
/// * items are serialized in JSON format and separated by commas
/// 
/// In other words, the whole stream is just a valid JSON array.
/// 
/// There is no special constraint on spaces or line breaks, nor on items. Items are usually objects but they may also be simple values, arrays or even nulls. Items may or may not be separated by lines. Any valid JSON array is a valid _simple JSON stream_.
/// 
/// For example the following is a valid simple JSON stream:
/// 
/// ``` json
/// [{ "firstName": "Jimy", "lastName": "Hendrix" },
///  { "firstName": "Jim", "lastName": "Morrison" },
///  "people are strange", 27, null,
///  { "firstName": "Janis", 
///    "lastName": "Joplin" },
///  [1, 2, 3, 
///   5, 8, 13],
///  true]
///  ```
/// 
/// ## Unbounded streams
/// 
/// Sometimes it is preferable to omit the `[` and `]` delimiters and to systematically append a comma after every entry, even after the last one. For example this is a better format for log files as it makes it easy to append entries.
/// 
/// This alternate format can be obtained by passing an `unbounded: true` option when creating the reader or the writer.
/// 
/// Here is an example of a normal, _bounded_, simple JSON stream:
/// 
/// ```
/// [{ "firstName": "Jimy", "lastName": "Hendrix" },
///  { "firstName": "Jim", "lastName": "Morrison" },
///  { "firstName": "Janis", "lastName": "Joplin" }]
/// ```
/// 
/// and the corresponding _unbounded_ stream:
/// 
/// ```
/// { "firstName": "Jimy", "lastName": "Hendrix" },
/// { "firstName": "Jim", "lastName": "Morrison" },
/// { "firstName": "Janis", "lastName": "Joplin" },
/// ```
/// 
/// ## API
/// 
/// `var ez = require("ez-streams")`  
/// 
module.exports = {
	/// * `transform = ez.transforms.json.parser(options)`  
	///   creates a parser transform. The following options can be set:  
	///   - `unbounded`: use _unbounded_ format  
	///   - `reviver`: reviver function which is passed to [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
	parser: function(options) {
		options = options || {};

		return function(_, reader, writer) {
			var results;
			var parser = require('i-json').createParser(function(val, path) {
				if (path.length == 1) results.push(val);
			}, 1);
			var buf;
			while ((buf = reader.read(_)) !== undefined) {
				results = [];
				parser.update(buf);
				for (var i = 0; i < results.length; i++) writer.write(_, results[i]);
			}
		};
	},

	/// * `transform = ez.transforms.json.formatter(options)`  
	///   creates a formatter transform. The following options can be set:  
	///   - `unbounded`: use _unbounded_ format  
	///   - `replacer`: replacer function which is passed to [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
	///   - `space`: space formatting directive which is passed to JSON.stringify.
	formatter: function(options) {
		options = options || {};
		return function(_, reader, writer) {
			if (!options.unbounded) writer.write(_, '[');
			reader.forEach(_, function(_, obj, i) {
				if (i > 0) writer.write(_, ',\n');
				writer.write(_, JSON.stringify(obj, options.replacer, options.space));
			});
			writer.write(_, options.unbounded ? ',' : ']');
			writer.write(_);
		}
	},
};