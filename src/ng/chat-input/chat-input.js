angular.module('tc').directive('chatInput', function(settings, session, irc, messages) {

	function link(scope, element) {
		scope.message = '';
		scope.session = session;
		scope.irc = irc;
		var input = element.find('input')[0];

		scope.getUsernames = function() {
			var channel = settings.channels[settings.selectedTabIndex];

			if (!channel) return [];
			else return _(messages(channel)).filter(hasUser).map(getNames).unique().value();

			function hasUser(message) {
				return !!message.user;
			}

			function getNames(message) {
				return message.user['display-name'] || message.user.username;
			}
		};
		
		scope.input = function() {
			var channel = settings.channels[settings.selectedTabIndex];
			if (!channel || !scope.message.trim().length) return;

			if (scope.message.charAt(0) === '/') {
				scope.message = '.' + scope.message.substr(1);
			}

			if (scope.message.indexOf('.w') === 0) {
				var words =  scope.message.split(' ');
				var username = words[1];
				var message = words.slice(2).join(' ');
				irc.whisper(username, message);
				messages.addWhisper(settings.identity.username, username, message);
			}

			else irc.say(channel, scope.message);

			scope.message = '';
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chat-input/chat-input.html',
		link: link
	}
});