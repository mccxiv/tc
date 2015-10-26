/**
 * Reference to the NW.js gui object
 *
 * @ngdoc factory
 * @name gui
 */
angular.module('tc').factory('gui', function() {
	console.log('LOAD: gui');
	var gui = nw.require('nw.gui');
	window.gui = gui; // TODO remove
	return gui;
});