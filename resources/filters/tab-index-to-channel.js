angular.module('tc').filter('tabIndexToChannel', ['settings', function(settings) {
	return function(input) {
		return settings.channels[input])
		return input.replace('#', '');
	};
}]);