angular.module('tc').directive('chatters', ['$http', '$filter', function($http, $filter) {
	
	function makeListUrl(broadcaster) {
		return 'https://tmi.twitch.tv/group/user/'+broadcaster+'/chatters?callback=JSON_CALLBACK';
	}
	
	function link(scope, element) {
		scope.api = {};
		
		fetchList();
		
		function fetchList() {
			var broadcaster = $filter('stripHash')(scope.channel);
			var url = makeListUrl(broadcaster);
			var req = $http.jsonp(url);
			req.success(onList);
			req.error(onListError);
		}		
		
		function onList(result, status) {
			if (result && result.data && result.data.chatters) {
				scope.api = result.data;
				console.log('Got user list for channel '+scope.channel, result.data);
			}
			else onListError(result, status);
		}	
		
		function onListError(result, status) {
			console.warn('NYI Error'); // TODO
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
		templateUrl: 'resources/chatters/chatters.html',
		scope: {channel: '='},
		link: link
	}
}]);