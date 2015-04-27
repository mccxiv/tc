angular.module('tc').factory('badges', ['$http', function($http) {
	return function(channel) {
		var url = 'https://api.twitch.tv/kraken/chat/'+channel+'/badges?callback=JSON_CALLBACK';
		return $http.jsonp(url);
	}
}]);