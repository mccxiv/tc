/**
 * Manages the window title :)
 *
 * @ngdoc factory
 * @name titleManager
 */
angular.module('tc').factory('titleManager', function($filter, channels, settings) {
	console.log('LOAD: titleManager');

	var capitalize = $filter('capitalize');
	var win = nw.Window.get();

	channels.on('change', function() {
		var prefix;
		var suffix = ' - Tc';
		var channel = settings.channels[settings.selectedTabIndex];
		if (channel) prefix = capitalize(channel);
		else prefix = 'Join channel';
		win.title = prefix+suffix;
	});

	return null;
});