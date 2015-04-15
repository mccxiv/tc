angular.module('tc').directive('channelPanel', ['settings', 'gui', '$filter', function(settings, gui, $filter) {
	
	function link(scope) {
		scope.settings = settings;

		scope.channel = function() {
			return settings.channels[settings.selectedTabIndex]
		};

		scope.broadcaster = function () {
			return $filter('stripHash')(scope.channel());
		};

		scope.leave = function() {
			settings.channels.splice(settings.selectedTabIndex, 1);
		};

		scope.openStream = function() {
			gui.Shell.openExternal('http://www.twitch.tv/'+scope.broadcaster()+'/popout');
		};

		scope.openChannel = function() {
			gui.Shell.openExternal('http://www.twitch.tv/'+scope.broadcaster());
		};
	}
	
	return {
		restrict: 'E',
		templateUrl: 'resources/channel-panel/channel-panel.html',
		link: link
	}
}]);