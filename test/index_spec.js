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
    result1 = transform(1);
    resultA = transform('A');

    expect(result1).to.equal(2);
    expect(resultA).to.equal(undefined);

    transform = null;
    result1 = null;
    resultA = null;

  });
    

  it('transforms complex objects', function() {
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
    



