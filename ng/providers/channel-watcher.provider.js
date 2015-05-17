/**
 * Provides and event for when channels get added
 * or removed or the selected index changes
 *
 * @ngdoc factory
 * @name channelWatcher
 */
angular.module('tc').factory('channelWatcher', function($rootScope, settings) {
	var Ee = require('events').EventEmitter;
	var ee = new Ee();

	$rootScope.$watchGroup([
		function() {return settings.channels.length},
		function() {return settings.selectedTabIndex}
	], function() {ee.emit('change');});

	return ee;
});