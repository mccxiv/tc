/**
 * Reference to the NW.js gui object
 *
 * @ngdoc factory
 * @name gui
 */
angular.module('tc').factory('gui', function() {
	var gui = require('nw.gui');
	window.gui = gui; // TODO remove
	return gui;
});