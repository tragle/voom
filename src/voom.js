var version = require('../package.json').version;
var lib = require('./lib.js');

module.exports = function () {

  function identity (x) {return x;}

  function matcher (val) {
    return function (x) {
      if (x === val) return val;
    }
  }

  function writer (val) {
    return function (x) {
      if (x) return val;
    }
  }

  function transformer (fn) {
    return function (val) {
      if (x) return fn(val);
    }
  }

  function methodOrDefault (method) {
    return function(arg) {
      if (lib.isObject(arg)) {
        return arg[method];
      }
      if (typeof arg === 'function') return arg;
      return lib.identity;
    }
  }

  function arrayTransformer () {
    if (!arguments.length) return identity;
    var args = Array.prototype.slice.call(arguments);
    var transform = valueTransformer.apply(null, lib.flatten(args));
    
    return lib.collect(transform);
  }

  function objectTransformer () {
    if (!arguments.length) return identity;
    var args = Array.prototype.slice.call(arguments);
    var first = args[0];
    var middle = args.slice(1, args.length - 1);
    var last = args[args.length - 1];

    if (!lib.isObject(first) || !lib.isObject(last)) return;

    var paths = [lib.indexPaths(first), lib.indexPaths(last)];
    var methods = []
      .concat(lib.indexMethods(first))
      .concat(lib.collect(lib.indexMethods)(middle))
      .concat(args.length > 1 ? lib.indexMethods(last) : []);
    var transformers = [], pipeline, transformer;
    for (var node in paths[1]) {
      transformer = null;
      pipeline = [];
      pipeline.push(lib.pathFind(paths[0][node]));
      for (var i in methods) {
        pipeline.push(methodOrDefault(methods[i])(paths[1][node]));
      }
      pipeline.push(lib.pathAssign(paths[1][node]));
      
      transformer = lib.pipe.apply(this, pipeline);
      transformers.push(transformer);
    }
    return lib.buildObj(transformers);
  }

  function valueTransformer () {
    if (!arguments.length) return identity;
    var args = Array.prototype.slice.call(arguments);
    function isFn (val) {return typeof val === 'function'}
    function notFn (val) {return !isFn(val);}
    var read, write;
    var startValPos = lib.firstIndex(args, notFn);
    var endValPos = lib.lastIndex(args, notFn);
    var startVal = args[startValPos];
    var endVal = args[endValPos];
    if (lib.isObject(startVal)) {
      return objectTransformer.apply(null, arguments);
    } else if (Array.isArray(startVal)) {
      return arrayTransformer.apply(null, arguments);
    } else {
      read = matcher(startVal);
      write = writer(endVal);
    }
    args.splice(startValPos, 0, read);
    args.splice(endValPos, 0, write);
    var chain = args.filter(isFn);
    return lib.pipe.apply(null, chain);
  }

  function morph () {
    if (!arguments.length) return identity;
    return valueTransformer.apply(this, arguments);
  }

  return {
    morph: morph,
    version: version
  };

}();

