angular.module('tc').directive('chat', ['$timeout', 'irc', function($timeout, irc) {
	
	function link(scope, element) {
		scope.messages = [];

		addChannelListener(irc, 'chat', scope.channel, addMessage);
		addChannelListener(irc, 'chat', scope.channel, autoScroll);		
		
		function addMessage(user, message) {
			$timeout(function() {
				scope.messages.push({user: user, message: message});
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
			console.log('addChannelListener callback fired');
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
		templateUrl: 'resources/chat/chat.html',
		scope: {channel: '='},
		link: link
	} 
}]);