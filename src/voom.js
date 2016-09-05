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

  function transformer () {
    if (!arguments.length) return identity;
    var args = Array.prototype.slice.call(arguments);
    function isFn (val) {return typeof val === 'function'}
    function notFn (val) {return !isFn(val);}
    var startValPos = lib.firstIndex(args, notFn);
    var endValPos = lib.lastIndex(args, notFn);
    var read = matcher(args[startValPos]);
    var write = writer(args[endValPos]);
    args.splice(startValPos, 0, read);
    args.splice(endValPos, 0, write);
    var chain = args.filter(isFn);
    return lib.pipe.apply(this, chain);
  }

  function morph () {
    if (!arguments.length) return identity;
    return transformer.apply(this, arguments);
  }

  return {
    morph: morph,
    version: version
  };

}();


// A B 1 C 2 D
// 1 A B C 2 D
