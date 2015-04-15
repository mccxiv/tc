angular.module('tc').directive('channelPanel', ['settings', function(settings) {
	return {
		restrict: 'E',
		templateUrl: 'resources/channel-panel/channel-panel.html',
		link: function(scope, element) {
			scope.settings = settings;
		}
	}
}]);