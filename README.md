# voom

[![npm version](https://badge.fury.io/js/voom.svg)](https://badge.fury.io/js/voom)

## Quick start

```javascript

var f = require('voom').f,
    schemaA = {a: 'foo', b: {c: 'bar'}},
    schemaB = {y: 'foo', z: 'bar'};
    
var transform = voom.f(schemaA, schemaB);

var result = transform({a: 'abc', b: {c: 'def'}});
// result:
// {y: 'abc', z: 'def'}

```




