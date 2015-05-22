angular.module('tc').directive('chatTabs', function($timeout, settings) {
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-tabs/chat-tabs.html',
		link: function(scope, element) {
			scope.settings = settings;
			scope.visible = [];
			element.attr('layout', 'column');

			// Wait for chat-outputs to be rendered
			// and select the tab to scroll it into view
			setTimeout(function() {
			 	element.find('md-tab-item').eq(settings.selectedTabIndex).click();
			}, 10);

			/**
			 * The chat-output directive should not be shown and hidden immediately
			 * because they it's a very CPU intensive operation, let the animations
			 * run first then do the heavy DOM manipulation.
			 * @param {string} channel
			 * @param {boolean} show
			 */
			scope.setVisibilityDelayed = function(channel, show) {
				$timeout(function() {
					scope.visible[channel] = show;
				}, show? 600 : 3000);
			};
		}
	} 
});