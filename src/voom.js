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
    var args = Array.prototype.slice.call(arguments),
      first = args[0],
      last = args[args.length -1],
      read = matcher(first),
      write = writer(last),
      chain = [read, write]; 
    return lib.sequence.apply(this, chain);
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

