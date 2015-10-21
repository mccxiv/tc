/**
 * Provides the tmi.js library
 *
 * @ngdoc factory
 * @name tmi
 */
angular.module('tc').factory('tmi', function() {
	//require('tmi.js'); Using browser version for now...
	return window.irc;
});