var expect = require('chai').expect;
var voom = require('..');

describe('version', function() {
  var version = voom.version;
  it('returns a string', function() {
    expect(typeof version).to.equal('string');
  });
  it('returns version 1', function() {
    expect(parseInt(version[0])).to.equal(1);
  });
});

