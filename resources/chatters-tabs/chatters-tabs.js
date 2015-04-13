angular.module('tc').directive('chattersTabs', ['settings', function(settings) {
	return {
		restrict: 'E',
		templateUrl: 'resources/chatters-tabs/chatters-tabs.html',
		link: function(scope) {scope.settings = settings;}
	}
}]);