var slice = [].slice;

module.exports.memoize = function(func) {
	var memo = {};

	return function() {
		var args = slice.call(arguments);

		if (args in memo) {
			return memo[args];
		} else {
			return memo[args] = func.apply(this, args);
		}
	};
};
