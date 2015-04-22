angular.module('tc').directive('chatOutput', ['$timeout', '$filter', 'irc', function($timeout, $filter, irc) {
	
	function link(scope, element) {
		scope.messages = [];

		addChannelListener(irc, 'chat', scope.channel, addMessage);		
		
		function addMessage(user, message) {
			scope.messages.push({
				user: user,
				messageHtml: $filter('emotify')(message, user.emote)
			});	
			if (scope.messages.length > settings.maxChaLines) {
				scope.messages.shift();
			}			
			$timeout(function() {
				scope.$apply(); // TODO why is this necessary? Don't work without it
				autoScroll();
			});
		}
		
		function autoScroll() {
			element[0].scrollTop = element[0].scrollHeight;
		}
	}

	/**
	 * When you only care about responding to events from a particular channel.
	 * 
	 * Adds event listener to `client` that only calls `handler` if the first 
	 * parameter of the listener matches `channel`.
	 * 
	 * The `handler` will not receive `channel` as first argument, as it's 
	 * already implied.
	 * 
	 * @param {{addListener: function}} client
	 * @param {string} event
	 * @param {string} channel
	 * @param {function} handler
	 */
	function addChannelListener(client, event, channel, handler) {
		client.addListener(event, function() {
			if (arguments[0] === channel) {
				// Convert `arguments` to a real array and
				// get rid of `channel` because it's implied
				var args = Array.prototype.slice.call(arguments);
				args.shift();
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