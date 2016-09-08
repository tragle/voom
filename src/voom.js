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
    lib.traverse (writer, function (source, target, n) {
      var path = lib.findPath(reader, source[n]);
      index[path.join('')] = getAssigner(source, n)
    }, writer);
    return index;
  };

  function mapper (reader, writer) {
    var index = indexSchemas (reader, writer) || {};
    return function (input) {
      lib.traverse(input, function(source, target, n, path) {
        var writeFn = index[path.join('')];
        if (lib.isFunction(writeFn)) writeFn(source[n]);
      });
      return lib.clone(writer);
    }
  };

  function f () {
    var args = Array.prototype.slice.call(arguments);
    if (!args.length) return lib.identity;
    var reader = args[0], writer = lib.last(args);
    if (lib.isObject(reader)) return mapper(reader, writer);
  }

  return {
    f: f,
    lib: lib,
    version: version
  };

}();
