angular.module('tc').directive('chatBox', ['settings', 'irc', function(settings, irc) {

	function link(scope) {
		scope.message = '';

		scope.keypress = function(event) {
			if (event.which === 13) {
				var channel = settings.channels[settings.selectedTabIndex];
				irc.say(channel, scope.message);
				scope.message = '';
			}
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'resources/chat-box/chat-box.html',
		link: link
	}
}]);