angular.module('tc').directive('chatters', ['$http', '$filter', function($http, $filter) {
	
	function makeListUrl(broadcaster) {
		return 'https://tmi.twitch.tv/group/user/'+broadcaster+'/chatters?callback=JSON_CALLBACK';
	}
	
	function link(scope) {
		scope.api = {};
		
		fetchList();
		
		function fetchList() {
			console.log('Getting user list for channel '+scope.channel);
			
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

	return {
		restrict: 'E',
		templateUrl: 'resources/chatters/chatters.html',
		scope: {channel: '='},
		link: link
	}
}]);