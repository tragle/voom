"use strict";

// [array], [array] -> Bool
var arraysAreEqual = exports.arraysAreEqual = function (arrayA, arrayB) {
  if (arrayA.length !== arrayB.length) return false;
  for (var i = 0; i < arrayA.length; i++) {
    if (arrayA[i] !== arrayB[i]) return false;
  }
  return true;
};

// {obj} -> {obj}
var clone = exports.clone = function (obj) {
  function visit(obj, copy) {
    for (var n in obj) {
      if (isObject(obj[n])) {
        copy[n] = {};
        visit(obj[n], copy[n]);
      } else if (isArray(obj[n])) {
        copy[n] = obj[n].map(function(item) {
          if (isObject(item)) return clone(item);
          return item;
        });
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
    var results = [], res;
    if (!isArray(array)) return results;
    for (var i = 0; i < array.length; i++) {
      res = fn(array[i]);
      if (!isNull(res) && !isUndefined(res)) results.push(res);
    }
    return results;
  };
};

// fn -> delayed() -> fn
var delay = exports.delay = function (fn) {
  return function delayed () {
    return fn;
  }
};

// [source], [target], fn -> [results]
var distribute = exports.distribute = function (source, target, fn) {
  var factor = source.length / target.length,
    results = [];
  fn = fn || function (a, b) {return [a, b];};
  for (var i = 0; i < target.length; i++) {
    results = results.concat(fn(source[Math.floor(i * factor)], target[i]));
  }
  return results;
};

// {}, val -> [path]
var findPath = exports.findPath = function (obj, val, includeArrays) {
  var path = [];
  val = isFunction(val) ? val.name : val;
  function visit(source) {
    for (var n in source) {
      var sourceName = isFunction(source[n]) ? source[n].name : source[n];
      path.push(n);
      if (sourceName === val) return true; 
      if (isObject(sourceName)) 
        if (visit(sourceName)) return true;
      if (includeArrays && isArray(sourceName))
        if (visit(sourceName)) return true;
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

// [[arrays]] -> [[groups]]
var groupArrays = exports.groupArrays = function (arrays) {
  var groups = [];
  arrays = arrays.slice(0);

  while (arrays.length) {
    var array = arrays.pop();
    if (!groups.length) {
      groups.push([array]);
      continue
    }
    for (var i in groups) {
      if (arraysAreEqual(array, groups[i][0])) {
        groups[i].push(array);
      } else {
        groups.push([array]);
      }
    }
  }
  return groups;
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

// {obj} -> {obj}
var nullify = exports.nullify = function (obj) {
  traverse(obj, function(source, n) {
    source[n] = isArray(source[n]) ? [] : null;
  });
  return obj
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

// {obj}, [path]  -> value
var readPath = exports.readPath = function (obj, path) {
  if (!path.length) return;
  if (path.length > 1) return readPath(obj[path[0]], path.slice(1));
  return obj[path[0]];
};

// val -> [val]
var toArray = exports.toArray = function (val) {
  if (isUndefined(val) || isNull(val)) return [];
  if (isArray(val)) return val;
  return [val];
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
  return target;
};

// val -> input -> val
var value = exports.value = function (val) {
  return function (input) {
    if (isValue(val) && isValue(input)) return val;
  }
};




