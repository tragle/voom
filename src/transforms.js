"use strict";

// val -> val
var emitter = exports.emitter = function (val) {
  if (!val) return identity;
  return function(x) {
    if (isValue(x)) return val;
  }
};

// val -> Boolean -> val
var gate = exports.gate = function (fn) {
  return function(val) {
    if (fn(val)) return val;
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

// [array], n -> item
var last = exports.last = function (array, n) {
  if (!array.length) return;
  var len = n ? array.length - n : array.length - 1;
  return Array.prototype.slice.call(array, len, array.length)
};

// fns -> fn
var pipe = exports.pipe = function () {
  var fns = arguments;
  if (isEmpty(fns)) return identity;

  return function (result) {
    for (var i = 0; i < fns.length; i++) {
      result = fns[i].call(this, result);
    }
    return result;
  };
};

// fns -> val -> val
var racer = exports.racer = function () {
  var fns = Array.prototype.slice.call(arguments);
  return function (val) {
    var result;
    for (var i = 0; i < fns.length; i++) {
      if (isFunction(fns[i])) {
        result = fns[i](val);
        if (isValue(result)) break;
      }
    }
    return result;
  };
};

var traverse = exports.traverse = function (source, fn, target) {
  target = target || {};
  function visit (source, target, fn) {
    for (var n in source) {
      if (isObject(source[n])) {
        visit(source[n], target, fn);
      } else {
        fn(source, target, n);
      }
    }
  }
  visit(source, target, fn);
  return target;
};

var findReplace = exports.findReplace = function (obj, val, replacement) {
  function visit(target) {
    for (var n in target) {
      if (target[n] === val) {
        target[n] = replacement;
        break;
      }
      if (isObject(target[n])) {
        visit(target[n]);
      }
    }
  }
  visit(obj);
  return obj;
};

function getAssigner(obj, key) {
  return function (val) {
    obj[key] = val;
  };
}

var addAssigners = exports.addAssigners = function (reader, writer) {
  traverse (writer, function (source, target, n) {
    findReplace(reader, source[n], getAssigner(source, n));
  }, writer);
  return reader;
};


