/**
 * Manages the window title :)
 *
 * @ngdoc factory
 * @name titleManager
 */
angular.module('tc').factory('titleManager', function($filter, channels, settings, gui) {

	var capitalize = $filter('capitalize');
	var win = gui.Window.get();

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