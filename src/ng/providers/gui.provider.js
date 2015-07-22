/**
 * Reference to the NW.js gui object
 *
 * @ngdoc factory
 * @name gui
 */
angular.module('tc').factory('gui', function() {
	return require('nw.gui');
});