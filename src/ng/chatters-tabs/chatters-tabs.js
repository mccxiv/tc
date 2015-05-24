angular.module('tc').directive('chattersTabs', ['settings', function(settings) {
	return {
		restrict: 'E',
		templateUrl: 'ng/chatters-tabs/chatters-tabs.html',
		link: function(scope, element) {
			scope.settings = settings;
		}
	}
}]);