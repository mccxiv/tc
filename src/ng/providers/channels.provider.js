/**
 * Provides and events for when channels get added
 * or removed or the selected index changes
 *
 * @ngdoc factory
 * @name channels
 *
 * @fires channels#change - When channel length or index change
 * @fires channels#add - Passes the channel that was added
 * @fires channels#remove - Passes the channel that was removed
 */
angular.module('tc').factory('channels', function($rootScope, settings) {
	var Ee = nw.require('events').EventEmitter;
	var ee = new Ee();
	ee.setMaxListeners(0);

	ee.channels = settings.channels;
	ee.current = currentChannel;

	$rootScope.$watchGroup([
		function() {return settings.channels.length},
		function() {return settings.selectedTabIndex}
	], function() {ee.emit('change');});

	$rootScope.$watchCollection(
		function() {return settings.channels},
		function(newValue, oldValue) {
			var added = _.difference(newValue, oldValue);
			var left = _.difference(oldValue, newValue);

			if (added.length) {
				added.forEach(function(channel) {
					console.log('CHANNEL-WATCHER: add', channel);
					ee.emit('add', channel);
				});
			}

			if (left.length) {
				left.forEach(function(channel) {
					console.log('CHANNEL-WATCHER: remove', channel);
					ee.emit('remove', channel);
				});
			}
		}
	);

	function currentChannel() {
		return settings.channels[settings.selectedTabIndex];
	}

	return ee;
});