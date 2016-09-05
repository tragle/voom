exports.pipe = function () {
  var fns = arguments;
  if (fns.length === 1) return fns[0];
  return function (x) {
    for (var i = 0; i < fns.length; i++) {
      x = fns[i](x);
    }
    return x;
  }
}

exports.firstIndex = function (list, pred) {
  if (!list || !list.length) return;
  if (!pred) return 0;
  for (var i = 0; i < list.length; i++) {
    if (pred(list[i])) return i;
  }
}

exports.lastIndex = function (list, pred) {
  if (!list || !list.length) return;
  if (!pred) return list.length - 1; 
  for (var i = list.length - 1; i > -1; i--) {
    if (pred(list[i])) return i;
  }
}


