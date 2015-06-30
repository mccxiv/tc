angular.module('tc').factory('_', function() {
	if (!window._) throw new Error('Lodash library not found!');
	return window._;
});