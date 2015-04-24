angular.module('tc').directive('chatOutput', ['$timeout', '$filter', '$http', 'irc', function($timeout, $filter, $http, irc) {
	
	function link(scope, element) {
		scope.messages = [];
		scope.badges = null;
		scope.maxChatLines = settings.maxChaLines;

		addChannelListener(irc, 'chat', scope.channel, addMessage);
		addChannelListener(irc, 'action', scope.channel, addMessage);
		fetchBadges();
		
		function addMessage(event, user, message) {
			scope.messages.push({
				user: user,
				type: event,
				messageHtml: $filter('emotify')(message, user.emote),
				messageCss: event === 'action'? 'color: '+user.color : ''
			});	
			$timeout(function() {
				scope.$apply(); // TODO why is this necessary? Don't work without it
				autoScroll();
			});
		}
		
		function fetchBadges() {
			var url = 'https://api.twitch.tv/kraken/chat/'+scope.channel+'/badges?callback=JSON_CALLBACK';
			console.log('CHAT-OUTPUT: badges url:', url);			
			$http.jsonp(url).success(function(badges) {
				console.log('CHAT-OUTPUT: badges json:', badges);
				scope.badges = badges;
			}); // TODO handle error, retry maybe.
		}
		
		function autoScroll() {
			element[0].scrollTop = element[0].scrollHeight;
		}

		scope.$on('$destroy', function() {
			console.warn('CHAT-OUTPUT: Destroying scope');
		});
	}

	/**
	 * When you only care about responding to events from a particular channel.
	 * 
	 * Adds event listener to `client` that only calls `handler` if the first 
	 * parameter of the listener matches `channel`.
	 * 
	 * The `handler` will not receive `channel` as first argument, instead,
	 * its first argument will be the event name
	 * 
	 * @param {Object} client      - Object to listen on, has .addListener method
	 * @param {String} event       - Event to listen for
	 * @param {String} channel     - Ignore events from channels other than this one
	 * @param {Function} handler   - Same as twitch-irc but first arg is `event`, not `channel`
	 */
	function addChannelListener(client, event, channel, handler) {
		client.addListener(event, function() {
			if (arguments[0] === '#'+channel) {
				// Convert `arguments` to a real array. TODO unnecessary?
				var args = Array.prototype.slice.call(arguments);
				args[0] = event;
				handler.apply(this, args);
			}
		});
	}
	
	return {
		restrict: 'E',
		templateUrl: 'resources/chat-output/chat-output.html',
		scope: {channel: '='},
		link: link
	} 
}]);