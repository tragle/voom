"use strict";

// {obj} -> {obj}
var clone = exports.clone = function (obj) {
  function visit(obj, copy) {
    for (var n in obj) {
      if (typeof obj[n] === 'object') {
        copy[n] = {};
        visit(obj[n], copy[n]);
      } else {
        copy[n] = obj[n];
      }
    }
    return copy;
  }
  return visit(obj, {});
};

// fn -> fn([array])
var collector = exports.collector = function (fn) {
  return function (array) {
    var results = [];
    if (!isArray(array)) return results;
    for (var i = 0; i < array.length; i++) {
      results.push(fn(array[i]));
    }
    return results;
  };
};

// {}, val -> [path]
var findPath = exports.findPath = function (obj, val, includeArrays) {
  var path = [];
  function visit(source) {
    for (var n in source) {
      path.push(n);
      if (source[n] === val) return true; 
      if (isObject(source[n])) 
        if (visit(source[n])) return true;
      if (includeArrays && isArray(source[n]))
        if (visit(source[n])) return true;
      path.pop();
    }
  }
  visit(obj);
  return path;
};

// val -> input -> val | void
var gate = exports.gate = function (val) {
  return function (input) {
    if (input === val) return val;
  }
};

// val -> val 
var identity = exports.identity = function (val) {
  return val;
};

// val -> Bool
var isArray = exports.isArray = function (val) {
  return Array.isArray(val);
};

// val -> Bool
var isEmpty = exports.isEmpty = function (val) {
  return !isValue(val) || !!(val.length === 0);
};

// val -> Bool
var isFunction = exports.isFunction = function (val) {
  return typeof val === 'function';
};

// val -> Bool
var isNull = exports.isNull = function (val) {
  return val === null;
};

// val -> Bool
var isObject = exports.isObject = function (val) {
  return !!val && val.constructor && val.constructor === Object;
};

// val -> Bool
var isPrimitive = exports.isPrimitive = function (val) {
  return isValue(val) && !isObject(val) && !isArray(val) && !isFunction(val);
};

// val -> Bool
var isUndefined = exports.isUndefined = function (val) {
  return val === void 0;
};

// val -> Bool
var isValue = exports.isValue = function (val) {
  return !isNull(val) && !isUndefined(val);
};

// [array], n -> [array]
var last = exports.last = function (array, n) {
  if (!array.length) return;
  var len = n ? array.length - n : array.length - 1;
  return Array.prototype.slice.call(array, len, array.length)
};

// fns -> fn
var pipe = exports.pipe = function () {
  if (!arguments.length) return identity;
  if (arguments.length === 1) return arguments[0];
  var fns = arguments;
  return function (x) {
    for (var i = 0; i < fns.length; i++) {
      x = fns[i](x);
    }
    return x;
  }
};

// {source}, fn({source}, {target}, n, [path]), {target} -> void 
var traverse = exports.traverse = function (source, fn, target) {
  var path = [];
  function visit (source, target, fn) {
    for (var n in source) {
      path.push(n);
      if (isObject(source[n])) {
        visit(source[n], target, fn);
      } else {
        fn(source, n, target, path.slice(0));
      }
      path.pop();
    }
  }
  visit(source, target, fn);
};

// val -> input -> val
var value = exports.value = function (val) {
  return function (input) {
    if (!isUndefined(input) && !isNull(input)) return val;
  }
};

