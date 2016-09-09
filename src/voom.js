var version = require('../package.json').version;
var lib = require('./lib.js');


module.exports = function () {

  function getAssigner (obj, key) {
    return function (val) {
      obj[key] = val;
    };
  }

  function indexSchemas (reader, writer) {
    var index = {};
    lib.traverse (writer, function (source, n, target) {
      var path = lib.findPath(reader, source[n]);
      index[path.join('')] = getAssigner(source, n)
    }, writer);
    return index;
  };

  function mapper (reader, writer) {
    var index = indexSchemas (reader, writer) || {};
    return function (input) {
      lib.traverse(input, function(source, n, target, path) {
        var writeFn = index[path.join('')];
        if (lib.isFunction(writeFn)) writeFn(source[n]);
      });
      return lib.clone(writer);
    }
  };

  function f () {
    var args = Array.prototype.slice.call(arguments);
    if (!args.length) return lib.identity;
    var reader = args[0], writer = args.length > 1 ? lib.last(args, 1)[0] : null;
    if (lib.isArray(reader)) return lib.collector(f(reader[0], writer ? writer[0] : reader[0]));
    if (lib.isObject(reader)) return mapper(reader, writer || reader);
    if (lib.isValue(reader)) return lib.pipe(lib.gate(reader), writer ? lib.value(writer): lib.identity);
  }

  return {
    f: f,
    lib: lib,
    version: version
  };

}();


// value
// object
// array
//
// value:           gate(value)
// value, value:    gate(value) -> value(value)
//
// object, object:  map(object, object)
//
// array[x], array[x]: collect(f(x, x))
// array[x]
//
