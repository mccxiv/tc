angular.module('tc').directive('chatInput', ['settings', 'irc', function(settings, irc) {

	function link(scope) {
		scope.message = '';
		
		scope.say = function() {
			var channel = settings.channels[settings.selectedTabIndex];
			irc.say(channel, scope.message);
			scope.message = '';
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chat-input/chat-input.html',
		link: link
	}
}]);