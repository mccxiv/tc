angular.module('tc').directive('chatInput', function(settings, irc, messages) {

	function link(scope) {
		scope.message = '';

		scope.getUsernames = function() {
			var channel = settings.channels[settings.selectedTabIndex];

			if (!channel) return [];
			else return _(messages(channel)).filter(hasUser).map(getNames).unique().value();

			function hasUser(message) {
				return !!message.user;
			}

			function getNames(message) {
				return message.user.username;
			}
		};
		
		scope.say = function() {
			var channel = settings.channels[settings.selectedTabIndex];
			if (!channel) return;
			
			if (scope.message.charAt(0) === '/') {
				scope.message = '.' + scope.message.substr(1);
			}
			
			irc.say(channel, scope.message);
			scope.message = '';
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chat-input/chat-input.html',
		link: link
	}
});