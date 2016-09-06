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

describe('morph', function() {
  var transform, result;

  it('returns a function', function() {
    transform = voom.morph();
    result = transform('abc');

    expect(typeof transform).to.equal('function');

    transform = null;
    result = null;
  });

  it('returns identity if called with zero args', function() {
    transform = voom.morph();
    result = transform('abc');

    expect(result).to.equal('abc');

    transform = null;
    result = null;
  });

  it ('transforms simple values', function() {
    transform = voom.morph(1, 2);
    var result1 = transform(1);
    var resultA = transform('A');

    expect(result1).to.equal(2);
    expect(resultA).to.equal(undefined);

    transform = null;
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
    transform = voom.morph(2, doubler, stringer);
    result = transform(2);

    expect(result).to.equal("4");
    
    doubler = null;
    stringer = null;
    transform = null;
    result = null;

  });

  it('transforms flat objects', function() {
    var s1 = {a: 'foo', b: 'bar'},
      s2 = {y: 'foo', z: 'bar'};
    transform = voom.morph(s1, s2);
    result = transform({a: 'abc', b: 'def'});

    expect(result).to.eql({y: 'abc', z: 'def'});
    
    s1 = null;
    s2 = null;
    transform = null
    result = null;
  });

  it('transforms nested objects', function() {
    var s1 = {a: 'foo', b: {c: 'bar'}},
      s2 = {y: 'foo', z: 'bar'};
    transform = voom.morph(s1, s2);
    result = transform({a: 'abc', b: {c: 'def'}});

    expect(result).to.eql({y: 'abc', z: 'def'});
    
    s1 = null;
    s2 = null;
    transform = null
    result = null;
  });

  it('transforms object collections', function() {
    var s1 = [{a: 'foo', b: 'bar'}],
      s2 = [{y: 'foo', z: 'bar'}];
    transform = voom.morph(s1, s2);
    result = transform([{a: 'abc', b: 'def'}, {a: 'ghi', b: 'jkl'}]);

    assert.sameDeepMembers(result, [{y: 'abc', z: 'def'}, {y: 'ghi', z: 'jkl'}]);

    s1 = null;
    s2 = null;
    transform = null
    result = null;
  });

  it('transforms value collections', function() {
    var s1 = [1],
      s2 = [3];
    transform = voom.morph(s1, s2);
    result = transform([1, 2, 3, 4, 5]);

    expect(result).to.eql([3]);

    s1 = null;
    s2 = null;
    transform = null
    result = null;
  });

  xit('transforms complex objects', function() {
    transform = voom.morph(schemaA, schemaB);
    result = transform(dataIn);

    expect(result).to.eql(validResult);

    transform = null;
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
    



