var lib = require ('../src/lib');
var expect = require('chai').expect;

var result;

describe('identity', function() {
  it('returns its argument', function() {
    result = lib.identity(123);

    expect(result).to.equal(123);

    result = null;
  });
});


