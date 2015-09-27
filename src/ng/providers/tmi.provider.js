/**
 * Provides the tmi.js library
 *
 * @ngdoc factory
 * @name tmi
 */
angular.module('tc').factory('tmi', function() {
	require('tmi.js');
	return window.irc; // tmi.js thinks this is a browser
});