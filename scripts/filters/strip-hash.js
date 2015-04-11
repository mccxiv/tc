angular.module('tc').filter('stripHash', function() {
	return function(input) {
		input = input || '';
		return input.replace('#', '');
	};
});