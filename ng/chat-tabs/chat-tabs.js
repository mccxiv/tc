angular.module('tc').directive('chatTabs', ['settings', function(settings) {
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-tabs/chat-tabs.html',
		link: function(scope, element) {
			scope.settings = settings;
			element.attr('layout', 'column');

			// Wait for chat-outputs to be rendered
			// and select the tab to scroll it into view
			setTimeout(function() {
			 	element.find('md-tab-item').eq(settings.selectedTabIndex).click();
			}, 10);
		}
	} 
}]);