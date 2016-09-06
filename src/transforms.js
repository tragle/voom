"use strict";

// arguments -> args
var args = exports.args = function () {
  return Array.prototype.slice.call(arguments);
};

// val -> val
var emitter = exports.emitter = function (val) {
  if (!val) return identity;
  return function(x) {
    if (isVal(x)) return val;
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
  return !isValue(val) || (val.length && val.length === 0)  
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
  return isNumber(val) || isString(val);
};

// val -> Bool
var isUndefined = exports.isUndefined = function (val) {
  return val === void 0;
};

// val -> Bool
var isValue = exports.isValue = function (val) {
  return !isNaN(val) && !isNull(val) && !isUndefined(val);
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
  var fns = args(arguments);
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

// val -> val | void
var values = exports.values = gate(isValue); 
var empties = exports.empties = gate(isEmpty);
var primitives = exports.primitives = gate(isPrimitive);
var functions = exports.functions = gate(isFunction); 
var arrays = exports.arrays = gate(isArray);
var objects = exports.objects = gate(isObject);


