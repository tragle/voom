var version = require('../package.json').version;
var lib = require('./transforms.js');

module.exports = function () {

  var fPrimitive = lib.identity;
  var fFuntion = lib.identity;
  var fArray = lib.identity;
  var fObject = lib.identity;

  function f () {
    var parsers = [
      lib.pipe(lib.isEmpty, lib.identity),
      lib.pipe(lib.isPrimitive, fPrimitive),
      lib.pipe(lib.isFunction, fFunction),
      lib.pipe(lib.isArray, fArray),
      lib.pipe(lib.isObject, fObject)
    ];
    return lib.race(parsers); 
  }

  return {
    f: f,
    lib: lib,
    version: version
  };

}();

// isEmpty -> identity
// isArray -> fArray 
// isObject -> fObject
// isValue -> fValue
