angular.module('tc').directive('chatInput', function(settings, session, irc, messages) {

	function link(scope, element) {
		scope.message = '';
		scope.session = session;
		var input = element.find('input')[0];
		var inputContainer = element.find('md-input-container');

		irc.on('say-available', function() {
			inputContainer.removeClass('disabled');
			input.removeAttribute('disabled');
		});

		irc.on('say-unavailable', function() {
			inputContainer.addClass('disabled');
			input.setAttribute('disabled', 'disabled');
		});

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
			if (!channel || !scope.message.trim().length) return;
			
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