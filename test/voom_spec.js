var expect = require('chai').expect;
var assert = require('chai').assert;
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

describe('f', function() {
  var fn, result;

  it('throws an error when provided invalid arguments', function() {
    var s1 = 2, s2 = {a: 2};
    var didError = false;

    try {
      fn = voom.f(s1, s2);
    } catch (e) {
      if (e.message.indexOf('arguments') > -1) didError = true;
    }

    expect(didError).to.equal(true);

    fn = null;

  });

  it('returns a function', function() {
    fn = voom.f();
    result = fn('abc');

    expect(typeof fn).to.equal('function');

    fn = null;
    result = null;
  });

  it('returns identity if called with zero args', function() {
    fn = voom.f();
    result = fn('abc');

    expect(result).to.equal('abc');

    fn = null;
    result = null;
  });

  it('takes a single value schema', function() {
    fn = voom.f(1);
    var result1 = fn(1);
    var resultA = fn('A');

    expect(result1).to.equal(1);
    expect(resultA).to.equal(undefined);

    fn = null;
    result1 = null;
    resultA = null;
  });

  it ('transforms simple values', function() {
    fn = voom.f(1, 2);
    var result1 = fn(1);
    var resultA = fn('A');

    expect(result1).to.equal(2);
    expect(resultA).to.equal(undefined);

    fn = null;
    result1 = null;
    resultA = null;
  });

  it ('passes values through transforms', function() {
    var doubler = function (x) {
      if (x) return x * 2;
    };
    var stringer = function (x) {
      if (x) return x.toString();
    }
    fn = voom.f(2, doubler, stringer);
    result = fn(2);

    expect(result).to.equal("4");
    
    doubler = null;
    stringer = null;
    fn = null;
    result = null;
  });

  it('takes a single object schema', function() {
    var s1 = {a: 'foo', b: 'bar'},
    fn = voom.f(s1);

    result = fn({a: 'abc', b: 'def'});

    expect(result).to.eql({a: 'abc', b: 'def'});

    s1 = null;
    fn = null
    result = null;
  });

  it('transforms flat objects', function() {
    var s1 = {a: 'foo', b: 'bar'},
      s2 = {y: 'foo', z: 'bar'};
    fn = voom.f(s1, s2);
    result = fn({a: 'abc', b: 'def'});

    expect(result).to.eql({y: 'abc', z: 'def'});
    
    s1 = null;
    s2 = null;
    fn = null
    result = null;
  });

  it('transforms nested objects', function() {
    var s1 = {a: 'foo', b: {c: 'bar'}},
      s2 = {y: 'foo', z: 'bar'};
    fn = voom.f(s1, s2);
    result = fn({a: 'abc', b: {c: 'def'}});

    expect(result).to.eql({y: 'abc', z: 'def'});
    
    s1 = null;
    s2 = null;
    fn = null
    result = null;
  });

  it('takes a single array schema', function() {
    var s1 = [{a: 'foo', b: 'bar'}];
    fn = voom.f(s1);
    result = fn([{a: 'abc', b: 'def'}, {a: 'ghi', b: 'jkl'}]);

    assert.sameDeepMembers(result, [{a: 'abc', b: 'def'}, {a: 'ghi', b: 'jkl'}]);

    s1 = null;
    s2 = null;
    fn = null
    result = null;
  });

  it('takes an object and array schema', function () {
    var s1 = {a: 'foo', b: 'bar'},
      s2 = [{y: 'foo', z: 'bar'}];
    fn = voom.f(s1, s2);

    result = fn({a: 'abc', b: 'def'});

    assert.sameDeepMembers(result, [{y: 'abc', z: 'def'}]);

    s1 = null;
    s2 = null;
    fn = null
    result = null;
  });

  it('transforms object collections', function() {
    var s1 = [{a: 'foo', b: 'bar'}],
      s2 = [{y: 'foo', z: 'bar'}];
    fn = voom.f(s1, s2);
    result = fn([{a: 'abc', b: 'def'}, {a: 'ghi', b: 'jkl'}]);

    assert.sameDeepMembers(result, [{y: 'abc', z: 'def'}, {y: 'ghi', z: 'jkl'}]);

    s1 = null;
    s2 = null;
    fn = null
    result = null;
  });

  it('transforms value collections', function() {
    var s1 = [1],
      s2 = [3];
    fn = voom.f(s1, s2);
    result = fn([1, 2, 3, 4, 5]);

    expect(result).to.eql([3]);

    s1 = null;
    s2 = null;
    fn = null
    result = null;
  });

  xit('transforms mixed objects', function() {
    var s1 = {a: 1, b: [{c: 2}], d: {e: [3]}}, 
      s2 = {v: 1, w: {x: [{y: 2}], z: [3]}};
    fn = voom.f(s1, s2);
    result = fn({a: 9, b: [{c: 8}, {c: 9}], d: {e: [3, 4, 5]}})

    expect(result).to.eql({v: 9, w: {x: [{y: 9}, {y: 9}], d: {e: [3, 4, 5]}}});

    s1 = null;
    s2 = null;
    fn = null
    result = null;
  });

  xit('transforms complex objects', function() {
    fn = voom.f(schemaA, schemaB);
    result = fn(dataIn);

    expect(result).to.eql(validResult);

    fn = null;
    result = null;
  });
});

var schemaA = {
  name: 'Ziggy Ragle',
  age: 16,
  classes: [
    {
      name: 'Geometry',
      instructor: 'Smith',
      grades: ['A-', 'C+', 'B']
    },
    {
      name: 'Physical Education',
      instructor: 'Hussein',
      grades: ['B', 'B-', 'A']
    }
  ],
  number: '001248',
  grade: 10
};

var schemaB = {
  number: '001248',
  coursework: [
    {
      course: 'Geometry',
      student: 'Ziggy Ragle',
      grades: ['A-', 'C+', 'B']
    },
    {
      course: 'Physical Education',
      student: 'Ziggy Ragle',
      grades: ['B', 'B-', 'A']
    }
  ]
}


var dataIn = {
  name: 'Melissa Cromwell',
  age: 17,
  classes: [
    {
      name: 'Art',
      instructor: 'Puckett',
      grades: ['A', 'A+']
    },
    {
      name: 'English',
      instructor: 'Ferraro',
      grades: ['B', 'B+']
    },
    {
      name: 'Home Economics',
      instructor: 'Lopez',
      grades: ['C', 'C+']
    }
  ],
  number: '092212',
  grade: 12
};

var validResult = {
  number: '092212',
  coursework: [
    {
      course: 'Art',
      student: 'Melissa Cromwell',
      grades: ['A', 'A+']
    },
    {
      course: 'English',
      student:'Melissa Cromwell',
      grades: ['B', 'B+']
    },
    {
      course: 'Home Economics',
      student:'Lopez',
      grades: ['C', 'C+']
    }
  ]
}
    



