exports.sequence = function () {
  var fns = arguments;
  if (fns.length === 1) return fns[0];
  return function (x) {
    for (var i = 0; i < fns.length; i++) {
      x = fns[i](x);
    }
    return x;
  }
}

