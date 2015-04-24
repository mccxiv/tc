angular.module('tc').directive('chatTabs', ['settings', function(settings) {
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-tabs/chat-tabs.html',
		link: function(scope, element) {
			scope.settings = settings;
			element.attr('layout', 'column');
		}
	} 
}]);