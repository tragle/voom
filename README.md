# voom

[![npm version](https://badge.fury.io/js/voom.svg)](https://badge.fury.io/js/voom)

Voom helps create functions for mapping values. 

You supply example values and voom computes a function for converting similar values.

### Installation

`require` voom and call the `f` function.

### Transforming objects

In general, objects are mapped structurally based on shared values in two object literals, or schemas.

```javascript
var f = require('voom').f,
    schemaA = {a: 'foo', b: {c: 'bar'}},
    schemaB = {y: 'foo', z: 'bar'};
    
var transform = f(schemaA, schemaB);

var result = transform({a: 'abc', b: {c: 'def'}});
// {y: 'abc', z: 'def'}
```

The function returned above will always produce an object with `y` and `z` properties, regardless of any "extra" properties in its input. 

Taking advantage of this, if we supply a single schema, we get a function that trims unwanted properties off of objects.

```javascript
var s1 = {a: 'foo', b: 'bar'},
fn = f(s1);

result = fn({a: 'abc', b: 'def', c: 'ghi'});
// {a: 'abc', b: 'def'}
```

### Transforming primitives

If you supply two primitive values, voom computes a function that returns the second value if the first value is passed in. 

```javascript
fn = f(1, 2);
var result1 = fn(1);
var resultA = fn('A');

// result1 = 2
// resultA = undefined
```

Or, supply a single primitive to get a function that returns that value when it is passed that value.

```javascript
fn = f(1);
var result1 = fn(1);
var resultA = fn('A');

// result1 = 1 
// resultA = undefined
```

What happens if you supply nothing? You get an identity function, which simply returns its arguments.

```javascript
fn = f();
var result1 = fn(1);
var resultA = fn('A');

// result1 = 1 
// resultA = 'A'
```

