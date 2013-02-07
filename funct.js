var funct = {};

// Apply some arguments at the beginning of the call list
//  (similar to tack)
funct.partial = function(fn, var_args) {
  var extras = [].slice.call(arguments, 1);
  return function() {
    var args = [].slice.call(arguments);
    var out = extras.concat(args);
    return fn.apply(this, out);
  }
};

// Tack on some arguments to the end of the eventual call of fn
//  (similar to apply)
funct.tack = function(fn, var_args) {
  var extras = [].slice.call(arguments, 1);
  return function() {
    var args = [].slice.call(arguments);
    var out = args.concat(extras);
    return fn.apply(this, out);
  }
};

// Drops a number of arguments from the beginning of the call
// Useful for, e.g., async.waterfall when we don't care about the results
funct.drop = function(numArgs) {
  return function() {
    return fn.apply(this, [].slice.call(arguments, numArgs));
  }
};

// Drop from the end of the arguments instead of the beginning
funct.dropEnd = function(numArgs) {
  return funct.drop(-numArgs);
};

// Drop all the arguments
funct.dropAll = function(fn) {
  // TODO(gregp): compatibility of slice(Infinity)?
  return funct.drop(Infinity);
};

// Drop the arguments at the given array of positions
funct.dropSome = function(positions) {
  var fn = [].pop.apply(arguments);

  // Keep an object of the array's contents, as we never need to recalc
  var i, posMap = {};
  for (i in positions) {
    posMap[positions[i]] = true;
  }

  return function() {
    // New args array per-invocation
    var j, args = [];
    for (j in arguments) {
      if (!posMap[j]) {
        // If it's not specifically excluded, include it.
        args.push(arguments[j]);
      }
    }
    return fn.apply(this, args);
  }
};

/**
 * Drops a number of arguments from the beginning of the arg list
 * Useful for, e.g., async.waterfall when we don't care about the results
 *  from a prior function call
 * @param {number} numArgs
 */
funct.drop = function() {
  var dropArgs = arguments;

  /**
   * @param {function(Error=, ...*)} next - node-style error/arguments callback
   */
  return function() {
    var arr = [].slice.apply(arguments);
    var next = arr.pop();
    // console.log(dropArgs);
    var sliced = [].slice.apply(arr, dropArgs);
    // console.log(sliced);
    var result = [null].concat(sliced);
    // console.log(result);
    // console.log(next);
    return next.apply(this, result);
  }
};

// Drop all the arguments
funct.dropAll = funct.drop(Infinity);

// Drop from the end of the arguments instead of the beginning
funct.dropEnd = function(numArgs) {
  return funct.drop(0, -numArgs);
};


// Drop the arguments at the given array of positions
funct.dropSome = function(positions) {
  // Keep an object of the array's contents, as we never need to recalc
  var i, posMap = {};
  for (i in positions) {
    posMap[positions[i]] = true;
  }

  return function() {
    var fn = [].pop.call(arguments);
    // New args array per-invocation
    var j, args = [null];
    for (j in arguments) {
      if (!posMap[j]) {
        // If it's not specifically excluded, include it.
        args.push(arguments[j]);
      }
    }
    return fn.apply(this, args);
  }
};


// Rearrange the args to the given function, by walking through
//  the given array and picking those positional args out
funct.rearrange = function(fn, positions) {
  return function() {
    var pos, out = [];
    for (var i = 0, len = positions.length; i < len; ++i) {
      pos = positions[i];
      out.push(arguments[pos]);
    }
    return fn.apply(this, out);
  }
};

// Return a function that short circuits to call errback
//  when passed a truthy first argument.
funct.err = function(errback, fn, opt_context) {
  return function() {
    var err = arguments[0];
    if (err) {
      return errback(err);
    } else {
      var args = [].slice.call(arguments, 1);
      // console.log('funct.err__args', args);
      return fn.apply(opt_context || this, args);
    }
  }
};

// Print out the arguments, along with an optional name, before evaluating
// TODO(gregp): test
funct.printargs = function(fn, opt_name) {
  return function() {
    var descr = opt_name ? (opt_name + ': ') : '';
    console.log(descr, arguments);
    return fn.apply(this, arguments);
  }
};

// Print out all the arguments except the last, which is treated as a cb
funct.fax = function(opt_name) {
  return function() {
    var args = [].slice.call(arguments);

    // Print the incoming args
    var descrIn = opt_name ? (opt_name + ' (fax in): ') : '';
    console.log(descrIn, args);

    // Shift off the function and add a non-error
    var fn = args.pop();
    args.unshift(null);

    // Print the outgoing args
    var descrOut = opt_name ? (opt_name + ' (fax out): ') : '';
    console.log(descrOut, args);

    // Call the next function
    fn.apply(this, args);
  }
};

// Lightweight tracer, drop-in for racetrack
funct.lightrace = function(obj, cb, name) {
  return funct.printargs(cb, name);
};

module.exports = funct;
