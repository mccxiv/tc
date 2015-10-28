angular.module('tc').factory('manifest', function() {
	return nw.require('./package.json');
});