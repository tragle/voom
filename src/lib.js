function identity (x) {return x;}
exports.identity = identity;

function initial (a, n) {
  if (!a.length) return;
  var len = n ? n : a.length - 1;
  return Array.prototype.slice.call(a, 0, len);
}
exports.initial = initial;
  
function last (a, n) {
  if (!a.length) return;
  var len = n ? a.length - n : a.length - 1;
  return Array.prototype.slice.call(a, len, a.length)
}
exports.last = last;

function compose (fns) {
  return function (result) {
    for (var i = fns.length - 1; i > -1; i--) {
      result = fns[i].call(this, result);
    }

    return result;
  };
}
exports.compose = compose;

function pipe () {
  if (!arguments.length) return identity;
  if (arguments.length === 1) return arguments[0];
  var fns = arguments;
  return function (x) {
    for (var i = 0; i < fns.length; i++) {
      x = fns[i](x);
    }
    return x;
  }
}
exports.pipe = pipe;

function traverse (source, fn) {
  var stack = [], target = {};

  function visit (source, target, fn) {
    for (var n in source) {
      stack.push(n);
      if (typeof source[n] === 'object') {
        visit(source[n], target, fn);
      } else {
        fn(target, source[n], stack.slice(0));
      }
      stack.pop();
    }
  }
  
  visit(source, target, fn);

  return target;

}
exports.traverse = traverse;

function firstIndex (list, pred) {
  if (!list || !list.length) return;
  if (!pred) return 0;
  for (var i = 0; i < list.length; i++) {
    if (pred(list[i])) return i;
  }
}
exports.firstIndex = firstIndex;

function lastIndex (list, pred) {
  if (!list || !list.length) return;
  if (!pred) return list.length - 1; 
  for (var i = list.length - 1; i > -1; i--) {
    if (pred(list[i])) return i;
  }
}
exports.lastIndex = lastIndex;

function isObject (val) {
  return (
    val !== null && val.constructor === Object && !Array.isArray(val)
  );
}
exports.isObject = isObject;

function indexPaths (obj) {

  function update (target, val, path) {
    target[val] = path;
  }

  return traverse (obj, update);
}
exports.indexPaths = indexPaths;

function indexMethods (obj) {
  if (!isObject(obj)) return obj;

  function update (target, val, path) {
    if (typeof val === 'function') { 
      target[val] = val;
    } 
  }

  return traverse (obj, update);
}
exports.indexMethods = indexMethods;

function pathFind (path) {
  return function find(obj) {
    path = Array.prototype.slice.call(path);
    for (var p in path) {
      if (isObject(obj[path[p]])) return pathFind(path.slice(1))(obj[path[p]]);
      return obj[path[p]];
    }
  }
}
exports.pathFind = pathFind

function buildObj (fns) {
  return function (input) {
    var obj = {};
    fns.forEach(function(fn) {
      var frag = fn(input);
      obj = merge(obj, frag);
    });
    return obj;
  }
}
exports.buildObj = buildObj

function pathAssign (path) {
  function getObj (k, v) {
    var o = {};
    o[k] = v;
    return o;
  }
  return function (val) {
    path = Array.prototype.slice.call(path);
    var key, leaf, leafKey, obj = {};
    leaf = path.length ? getObj(leafKey = last(path), null) : {};
    obj = leaf;
    for (var k in initial(path)) {
      var key = path[k];
      obj = getObj(key, obj);
    }
    leaf[leafKey] = val;
    return obj;
  }
}
exports.pathAssign = pathAssign;

function collect (fn) {
  return function(collection) {
    return collection.reduce(function(prev, curr) {
      var res = fn(curr);
      if (res) return prev.concat(res);
      if (!res) return prev;
    }, []);
  }
}
exports.collect = collect;

function merge(destination, source) {

  function assign (destination, source) {
    for (var property in source) {
      if (isObject(source[property])) {
        destination[property] = destination[property] || {};
        assign(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  };

  return assign(destination, source);
};
exports.merge = merge;

function flatten (list) {
  return list.reduce(function (prev, curr) {
    return prev.concat(curr);
  }, []);
}
exports.flatten = flatten;


