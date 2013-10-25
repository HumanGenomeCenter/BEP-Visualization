// underscore mixins
_.mixin({
	copy: function(original) {
		var copy;
		if (original instanceof Cell) {
			copy = new Cell();
		} else if (original instanceof Array) {
			copy = [];
		} else if (original instanceof Object) {
			copy = {};
		} else {
			console.log("Error. Could not make a copy.");
		}
		$.extend(true, copy, original);	// deep copy this onto a
		return copy;
	},
	has: function(arr, value) {
		if (arr.indexOf(value) >= 0) {
			return true;
		}
		return false;
	}
});
