angular.module('tc').directive('chat', ['irc', function(irc) {
	
	function link(scope, element) {
		scope.messages = [];

		if (irc.connected) join();
		else irc.addListener('connected', join);
		
		addChannelListener(irc, 'chat', scope.channel, addMessage);
		addChannelListener(irc, 'chat', scope.channel, autoScroll);
		
		function addMessage(user, message) {
			scope.messages.push({user: user, message: message});
			scope.$apply();
		}
		
		function autoScroll() {
			element[0].scrollTop = element[0].scrollHeight;
		}

		function join() {
			irc.join(scope.channel).catch(function() {
				console.warn('Error NYI'); // TODO handle error
			});
		}
	}

	/**
	 * When you only care about responding to events from a particular channel.
	 * 
	 * Adds event listener to `irc` that only calls `handler` if the first 
	 * parameter of the listener matches `channel`.
	 * 
	 * The `handler` will not receive `channel` as first argument, as it's 
	 * already implied.
	 * 
	 * @param {{addListener: function}} irc
	 * @param {string} event
	 * @param {string} channel
	 * @param {function} handler
	 */
	function addChannelListener(irc, event, channel, handler) {
		irc.addListener(event, function() {
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