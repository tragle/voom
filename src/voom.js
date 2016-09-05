var version = require('../package.json').version;

module.exports = function () {
  function identity (x) {return x;}

  return {
    morph: function() {return identity},
    version: version
  };

}();

