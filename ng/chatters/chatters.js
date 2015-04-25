angular.module('tc').directive('chatters', ['$http', '$filter', function($http, $filter) {
	
	function makeListUrl(broadcaster) {
		return 'https://tmi.twitch.tv/group/user/'+broadcaster+'/chatters?callback=JSON_CALLBACK';
	}
	
	function link(scope) {
		var forceShowViewers = false;
		var timeout = null;
		scope.api = null;
		scope.showViewers = function(force) {
			if (typeof force === 'boolean') forceShowViewers = force;
			if (!scope.api) return false;
			if (scope.api.chatters.viewers.length < 201) return true;
			else return forceShowViewers;
		};
		
		fetchList();
		
		function fetchList() {
			console.log('CHATTERS: Getting user list for channel '+scope.channel);
			
			var broadcaster = $filter('stripHash')(scope.channel);
			var url = makeListUrl(broadcaster);
			var req = $http.jsonp(url);
			req.success(onList);
			req.error(onListError);
			req.finally(fetchListDelayed);
			return req;
		}		
		
		function onList(result, status) {
			if (result && result.data && result.data.chatters) {
				console.log('CHATTERS: Got viewer list', result.data);
				scope.api = result.data;
			}
			else onListError(result, status);
		}
		
		function fetchListDelayed() {
			timeout = setTimeout(fetchList, 120000)
		}
		
		function onListError(result, status) {
			console.warn('NYI Error'); // TODO
		}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chatters/chatters.html',
		scope: {channel: '='},
		link: link
	}
}]);