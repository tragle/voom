var version = require('../package.json').version;
var lib = require('./lib.js');

module.exports = function () {

  function getTransformIndex (obj) {
    var index = {};
    lib.traverse (obj, function (source, n) {
      var path = lib.findPath(reader, source[n]),
        fn = lib.isFunction(source[n]) ? source[n] : lib.identity;
      index[pathToKey(path)] = fn; 
    });
    return index;
  }

  function getTransform (sources, key) {
    if (!sources || !sources.length) return lib.identity;
    if (!lib.isArray(sources)) return;
    var fns = sources.map(function(source) {
      if (lib.isFunction(source)) return source;
      if (lib.isObject(source)) return lib.isFunction(source[key]) ? source[key] : lib.identity;
      return f(source);
    });
    return lib.pipe.apply(null, fns);
  }

  function getAssigner (obj, key, transforms) {
    transforms = transforms || [];
    var name = lib.isFunction(obj[key]) ? obj[key].name : key;
    if (lib.isFunction(obj[key])) transforms.push(obj[key]);
    var fn = getTransform(transforms, key);
    fn = lib.isFunction(fn) ? fn : lib.identity;
    return function (val) {
      obj[name] = fn(val, obj, key);
    };
  }

  function pathToKey (path) {
    return path.join(':%:');
  }

  function getPathsForObj (reader, obj) {
    var paths = {};
    for (var k in obj) {
      var val = obj[k] ;
      if (lib.isObject(val)) 
        return getPathsForObj(reader, val);
      if (lib.isFunction(val)) val = val.name;
      paths[val] = lib.findPath(reader, val, true);
    }
    return paths;
  }

  function getPaths (reader, obj) {
    var targetPaths = getPathsForObj(reader, obj),
      result = {arrays: [], nonArrays: []};
    for (var tn in targetPaths) {
      var depth = targetPaths[tn].filter(function(key) {
        return key === "0";
      }).length;
      if (depth === 0) result.nonArrays.push(targetPaths[tn]);
      if (depth === 1) result.arrays.push(targetPaths[tn].slice(0, targetPaths[tn].indexOf("0")));
      if (depth > 1) throw new Error ("Unable to map nested arrays", "voom.js");
    }
    return result;
  }

  function indexArrayMap (index, indexKey, writer, writerKey, readerNode, writerArray) {
    index[indexKey] = getAssigner(writer, writerKey, [f(readerNode, writerArray)]);
  }

  function indexArrayMerges (index, paths, source, n, reader, writer, transforms) {
    for (var i in paths) {
      if (paths[i].length)
        var mapFn = f(lib.readPath(reader, paths[i])[0], source[n][0]);
      var mergeFn = function (left, right) {
        var newObj = mapFn(left);
        return lib.traverse(newObj, function(source, n, target) {
          if (!lib.isNull(source[n])) target[n] = source[n];
        }, right);
      };
      index[pathToKey(paths[i][0])] = lib.delay(getAssigner(source, n, 
        [function(readerColl) {
          return lib.distribute(readerColl, source[n], mergeFn);
        }]));
    }
  }

  function indexNonArrayMaps (index, paths, source, n, reader, writer, transforms) {
    for (var na in paths) {
      var nonArrayPath = paths[na];
      var readerVal = lib.readPath(reader, nonArrayPath);
      var keyToWrite = function() {
        for (var sn in source[n][0]) {
          if (source[n][0][sn] === readerVal) return sn;
        }
      }();
      var mapFn = function (val, obj, key) {
        return obj[key].map(function(item) {
          if (lib.isObject(item)) {
            item[keyToWrite] = val;
            return item;
          }
        });
      };
      var assigner = lib.delay(getAssigner(source, n, [mapFn]));
      index[pathToKey(nonArrayPath)] = assigner;
    } 
  }

  function indexCollection (index, source, n, reader, writer, transforms) {
    var paths = getPaths(reader, source[n]),
      arrayPaths = paths.arrays,
      nonArrayPaths = paths.nonArrays,
      pathGroups = lib.groupArrays(arrayPaths).sort(function (a,b){
        return b.length - a.length;
      });
    if (pathGroups.length) {
      var topPath = pathGroups[0], 
        otherPaths = pathGroups.slice(1);
      if (topPath.length) 
        indexArrayMap(index, pathToKey(topPath[0]), source, n, lib.readPath(reader, topPath[0]), source[n]);
      if (otherPaths.length)
        indexArrayMerges(index, otherPaths, source, n, reader, writer, transforms);
    }
    if (nonArrayPaths.length) {
      indexNonArrayMaps (index, nonArrayPaths, source, n, reader, writer, transforms);
    }
  }

  function getMapIndex (reader, writer, transforms) {
    return lib.traverse (writer, function (source, n, index) {
      if (lib.isArray(source[n])) {
        if (lib.isObject(source[n][0])) {
          indexCollection(index, source, n, reader, writer, transforms);
        }
      } else {
        var path = lib.findPath(reader, source[n]);
        index[pathToKey(path)] = getAssigner(source, n, transforms);
      }
    }, {});
  }


  function mapper (reader, writer, transforms) {
    var index = getMapIndex (reader, writer, transforms) || {};
    return function (input) {
      var queue = [];
      writer = lib.nullify(writer);
      lib.traverse(input, function(source, n, target, path) {
        var writeFn = index[pathToKey(path)];
        if (lib.isFunction(writeFn) && writeFn.name === 'delayed')
          queue.push(writeFn, source[n]);
        if (lib.isFunction(writeFn)) writeFn(source[n]);
      }, writer);
      for (var i = 0; i < queue.length; i+=2)
        queue[i]().call(null, queue[i+1]);
      return lib.clone(writer);
    }
  }

  function f () {
    var args = Array.prototype.slice.call(arguments);
    if (!args.length) return lib.identity;
    var reader = args[0], 
      writer = args.length > 1 ? lib.last(args, 1)[0] : null,
      transforms = args.length > 2 ? args.slice(1, args.length - 1) : [];
    if (lib.isObject(writer)) writer = lib.clone(writer)

    if (lib.isFunction(reader) && args.length === 1) 
      return reader;

    if (lib.isFunction(reader) && lib.isFunction(writer)) 
      return lib.pipe(reader, getTransform(transforms), writer);

    if (lib.isFunction(reader) && lib.isPrimitive(writer)) 
      return lib.pipe(reader, getTransform(transforms), lib.value(writer));

    if (lib.isObject(reader) && args.length === 1) 
      return mapper(reader, reader);

    if (lib.isObject(reader) && lib.isObject(writer)) 
      return mapper(reader, writer, transforms);

    if (lib.isObject(reader) && lib.isArray(writer)) 
      return lib.pipe(lib.toArray, f([reader], writer));

    if (lib.isArray(reader) && args.length === 1) 
      return lib.collector(f(reader[0], reader[0]));

    if (lib.isArray(reader) && lib.isArray(writer)) 
      return lib.collector(f(reader[0], writer[0]));

    if (lib.isPrimitive(reader) && args.length === 1) 
      return lib.gate(reader);

    if (lib.isPrimitive(reader) && lib.isFunction(writer)) 
      return lib.pipe(lib.gate(reader), getTransform(transforms), writer);

    if (lib.isPrimitive(reader) && lib.isPrimitive(writer)) 
      return lib.pipe(lib.gate(reader), getTransform(transforms), lib.value(writer));

    throw new Error ("Invalid arguments", "voom.js");

  }

  return {
    f: f,
    version: version
  };

}();

