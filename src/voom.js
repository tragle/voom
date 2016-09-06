var version = require('../package.json').version;
var lib = require('./lib.js');

module.exports = function () {

  function f () {


  }

  return {
    f: f,
    version: version
  };

}();

