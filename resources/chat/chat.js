angular.module('tc').directive('chat', ['irc', function(irc) {
	
	function link(scope, element) {
		scope.messages = [];
		
		init();

		function init() {
			irc.client.then(function(client) {
				console.log(client);
				if (client.connected) join();
				else client.addListener('connected', join);

				// TODO watch irc.client change instead?
				client.addListener('disconnected', init);
				
				addChannelListener(client, 'chat', scope.channel, addMessage);
				addChannelListener(client, 'chat', scope.channel, autoScroll);
			});
		}
		
		function addMessage(user, message) {
			scope.messages.push({user: user, message: message});
			scope.$apply();
		}
		
		function autoScroll() {
			element[0].scrollTop = element[0].scrollHeight;
		}

		function join() {
			irc.client.then(function(client) {
				client.join(scope.channel).catch(function() {
					console.warn('Error NYI'); // TODO handle error
				});
			});
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
		templateUrl: 'resources/chat/chat.html',
		scope: {channel: '='},
		link: link
	} 
}]);