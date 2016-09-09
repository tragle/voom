var version = require('../package.json').version;
var lib = require('./lib.js');

module.exports = function () {

  function getAssigner (obj, key, transforms) {
    var fn = getTransform(transforms, key);
    fn = lib.isFunction(fn) ? fn : lib.identity;
    return function (val) {
      obj[key] = fn(val);
    };
  }

  function getTransform (sources, key) {
    if (!sources || !sources.length) return lib.identity;
    if (!lib.isArray(sources)) return;
    var fns = sources.map(function(source) {
      if (lib.isFunction(source)) return source;
      if (lib.isObject(source)) return lib.isFunction(source[key]) ? source[key] : lib.identity;
      return f(source);
    });
    return lib.pipe.apply(null, fns);
  }

  function getTransformIndex (obj) {
    var index = {};
    lib.traverse (obj, function (source, n) {
      var path = lib.findPath(reader, source[n]),
        fn = lib.isFunction(source[n]) ? source[n] : lib.identity;
      index[path.join('')] = fn; 
    });
    return index;
  }

  function getMapIndex (reader, writer, transforms) {
    var index = {};
    lib.traverse (writer, function (source, n, target) {
      var path = lib.findPath(reader, source[n]);
      index[path.join('')] = getAssigner(source, n, transforms)
    }, writer);
    return index;
  }

  function mapper (reader, writer, transforms) {
    var index = getMapIndex (reader, writer, transforms) || {};
    return function (input) {
      lib.traverse(input, function(source, n, target, path) {
        var writeFn = index[path.join('')];
        if (lib.isFunction(writeFn)) writeFn(source[n]);
      });
      return lib.clone(writer);
    }
  }

  function f () {
    var args = Array.prototype.slice.call(arguments);
    if (!args.length) return lib.identity;
    var reader = args[0], 
      writer = args.length > 1 ? lib.last(args, 1)[0] : null,
      transforms = args.length > 2 ? args.slice(1, args.length - 1) : [];

    if (lib.isFunction(reader) && args.length === 1) return (
      reader);

    if (lib.isFunction(reader) && lib.isFunction(writer)) return (
      lib.pipe(reader, getTransform(transforms), writer));

    if (lib.isFunction(reader) && lib.isPrimitive(writer)) return (
      lib.pipe(reader, getTransform(transforms), lib.value(writer)));

    if (lib.isObject(reader) && args.length === 1) return (
      mapper(reader, reader));

    if (lib.isObject(reader) && lib.isObject(writer)) return (
      mapper(reader, writer, transforms));

    if (lib.isObject(reader) && lib.isArray(writer)) return (
      lib.pipe(lib.toArray, f([reader], writer)));

    if (lib.isArray(reader) && args.length === 1) return (
      lib.collector(f(reader[0], reader[0])));

    if (lib.isArray(reader) && lib.isArray(writer)) return (
      lib.collector(f(reader[0], writer[0])));

    if (lib.isPrimitive(reader) && args.length === 1) return (
      lib.gate(reader));

    if (lib.isPrimitive(reader) && lib.isFunction(writer)) return (
      lib.pipe(lib.gate(reader), getTransform(transforms), writer));

    if (lib.isPrimitive(reader) && lib.isPrimitive(writer)) return (
      lib.pipe(lib.gate(reader), getTransform(transforms), lib.value(writer)));

    throw Error("Invalid arguments " + args.toString());
  }

  return {
    f: f,
    lib: lib,
    version: version
  };

}();


