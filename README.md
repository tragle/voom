# voom

[![npm version](https://badge.fury.io/js/voom.svg)](https://badge.fury.io/js/voom)

Voom helps create functions for mapping values. 

You supply example values and voom computes a function for converting similar values.

### Installation

`require` voom, which exposes the `f` function.

### Transforming objects

In general, objects are mapped structurally based on shared values in two object literals, or schemas.

```javascript
var f = require('voom').f;
var schemaA = {a: 'foo', b: {c: 'bar'}};
var schemaB = {y: 'foo', z: 'bar'};
    
var transform = f(schemaA, schemaB);

var result = transform({a: 'abc', b: {c: 'def'}});
// {y: 'abc', z: 'def'}
```

The function returned above will always produce an object with `y` and `z` properties, regardless of any "extra" properties in its input. 

Taking advantage of this, if we supply a single schema, we get a function that trims extra properties from objects.

```javascript
var s1 = {a: 'foo', b: 'bar'};
var fn = f(s1);

var result = fn({a: 'abc', b: 'def', c: 'ghi'});
// {a: 'abc', b: 'def'}
```

### Transforming primitives

If you supply two primitive values, voom computes a function that returns the second value if the first value is passed in. 

```javascript
var fn = f(1, 2);
var result1 = fn(1);
var resultA = fn('A');

// result1 = 2
// resultA = undefined
```

Or, supply a single primitive to get a function that returns that value when it is passed that value.

```javascript
var fn = f(1);
var result1 = fn(1);
var resultA = fn('A');

// result1 = 1 
// resultA = undefined
```

What happens if you supply nothing? You get an identity function, which simply returns its arguments.

```javascript
var fn = f();
var result1 = fn(1);
var resultA = fn('A');

// result1 = 1 
// resultA = 'A'
```

### Transforms

Any value in any schema may be a function, and data will be passed through that function before being returned.  

```javascript
function bar (val) {
  if ((val) === 'def') return 'DEF';
}

var s1 = {a: 'foo', b: {c: bar}};
var s2 = {y: 'foo', z: 'bar'};
var fn = f(s1, s2);

var result = fn({a: 'abc', b: {c: 'def'}});
// {y: 'abc', z: 'DEF'}
```

Note that the `bar` function is matched with the `'bar'` string.

Voom will pipe values through all transform functions from left to right.

```javascript
var doubler = function (x) {
  if (x) return x * 2;
};

var stringer = function (x) {
  if (x) return x.toString();
}

var fn = f(2, doubler, stringer);

var result = fn(2);
// "4"
```

All values in objects are piped through transforms.

```javascript

function upper (val) {
  return val.toUpperCase();
}

var s1 = {a: 'foo', b: {c: 'bar'}};
var s2 = {y: 'foo', z: 'bar'};
var fn = f(s1, upper, s2);

var result = fn({a: 'abc', b: {c: 'def'}});
// {y: 'ABC', z: 'DEF'}
```

Provide only transform functions, and we get a function that pipes values through each transform.
```
var doubler = function (x) {
  if (x) return x * 2;
};
var stringer = function (x) {
  if (x) return x.toString();
}
var fn = f(doubler, stringer);

var result = fn(2);
// "4"
```

### Arrays

We can pass arrays directly to voom to compute a function that transforms collections.

```
var s1 = [{a: 'foo', b: 'bar'}];
var s2 = [{y: 'foo', z: 'bar'}];
var fn = f(s1, s2);

var result = fn([{a: 'abc', b: 'def'}, {a: 'ghi', b: 'jkl'}]);
// [{y: 'abc', z: 'def'}, {y: 'ghi', z: 'jkl'}]
```

Voom also computes functions to transform objects with embedded collections.

```javascript
var s1 = {a: 1, b: [{c: 2}]};
var s2 = {x: 1, y: [{z: 2}]};
var fn = f(s1, s2);

var result = fn({a: 9, b: [{c: 8}, {c: 45}]});
// {x: 9, y: [{z: 8}, {z: 45}]}
```

This even works with multiple collections.

```javascript
var s1 = {a: [{b: 1}], c: [{d: 2}]};
var s2 = {x: [{y: 1, z: 2}]};
var fn = f(s1, s2);

var result = fn({a: [{b: 101}, {b: 202}], c: [{d: 303}, {d: 404}]});
// {x: [{y: 101, z: 303}, {y: 202, z: 404}]}
```

Here's a more complex example, where values in an object are distributed to a collection embedded in the target object.

```javascript
var schemaA = {
  name: 'Ziggy Ragle',
  age: 16,
  classes: [
    {
      name: 'Geometry',
      instructor: 'Smith',
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
    }
  ]
}

var fn = f(schemaA, schemaB);

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

var result = fn(dataIn);
/*
{
  number: '092212',
  coursework: [
    {
      course: 'Art',
      student: 'Melissa Cromwell',
    },
    {
      course: 'English',
      student:'Melissa Cromwell',
    },
    {
      course: 'Home Economics',
      student:'Melissa Cromwell',
    }
  ]
}
*/
```
