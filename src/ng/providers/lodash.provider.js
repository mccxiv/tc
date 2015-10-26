angular.module('tc').factory('_', function() {
	console.log('LOAD: _');
	if (!window._) throw new Error('Lodash library not found!');
	return window._;
});