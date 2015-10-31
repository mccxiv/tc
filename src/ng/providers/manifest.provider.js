angular.module('tc').factory('manifest', function() {
	return require('remote').require('./package.json');
});