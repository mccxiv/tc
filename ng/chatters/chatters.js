angular.module('tc').directive('chatters', ['$http', '$filter', 'settings', function($http, $filter, settings) {
	
	function makeListUrl(broadcaster) {
		return 'https://tmi.twitch.tv/group/user/'+broadcaster+'/chatters?callback=JSON_CALLBACK';
	}
	
	function link(scope) {
		var forceShowViewers = false;
		var timeout = null;
		
		scope.api = null;
		scope.showViewers = showViewers;

		/**
		 * Fetches viewer list when this channel is selected.
		 * Avoids useless calls by waiting to see if the user sticks around
		 */
		onChannelSelected(function() {
			if (!scope.api) fetchList();
			else timeoutFetch(2000);
		});
		
		function fetchList() {
			if (!isChannelSelected()) return; // Abort
			console.log('CHATTERS: Getting user list for channel '+scope.channel);			
			var broadcaster = $filter('stripHash')(scope.channel);
			var url = makeListUrl(broadcaster);
			var req = $http.jsonp(url);
			req.success(onList);
			req.error(onListError);
			timeoutFetch(120000);
		}		
		
		function onList(result, status) {
			if (result && result.data && result.data.chatters) {
				console.log('CHATTERS: Got viewer list for '+scope.channel, result.data);
				scope.api = result.data;
			}
			else onListError(result, status);
		}
		
		function onListError(result, status) {
			console.warn('NYI Error'); // TODO
		}
		
		function isChannelSelected() {
			return settings.channels[settings.selectedTabIndex] === scope.channel;
		}
		
		function onChannelSelected(cb) {
			scope.$watch(
				function() {return settings.selectedTabIndex;},
				function() {if (isChannelSelected()) cb();}
			);
		}
		
		function timeoutFetch(duration) {
			clearTimeout(timeout);
			timeout = setTimeout(fetchList, duration);
		}
		
		function showViewers(force) {
			if (typeof force === 'boolean') forceShowViewers = force;
			if (!scope.api) return false;
			if (scope.api.chatters.viewers.length < 201) return true;
			else return forceShowViewers;
		}		
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chatters/chatters.html',
		scope: {channel: '='},
		link: link
	}
}]);