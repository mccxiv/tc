angular.module('tc').directive('chatTabs', function($timeout, settings, channelWatcher) {
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-tabs/chat-tabs.html',
		link: function(scope, element) {
			scope.settings = settings;
			scope.hidden = {};
			scope.loaded = {};
			element.attr('layout', 'column');

			// Wait for chat-outputs to be rendered
			// and select the tab to scroll it into view
			setTimeout(function() {
				clickTab(settings.selectedTabIndex);
			}, 10);

			// TODO remove this hack once they fix md-on-select
			scope.$watch(
				function() {return settings.channels.length},
				function(newL, oldL) {
					if (newL > oldL) {
						// New length is greater which means new channel was joined
						setTimeout(function() {
							clickTab(settings.channels.length);
						}, 10);

						setTimeout(function() {
							clickTab(settings.channels.length-1);
						}, 20);
					}
				}
			);

			if (currChannel()) scope.loaded[currChannel()] = true;

			/**
			 * The chat-output directive should not be shown and hidden immediately
			 * because they it's a very CPU intensive operation, let the animations
			 * run first then do the heavy DOM manipulation.
			 * @param {string} channel
			 * @param {boolean} show
			 */
			scope.load = function(channel, show) {
				$timeout(function() {
					// Abort unload operation if the tab to be hidden is selected again
					if (currChannel() === channel && !show) return;
					if (show) scope.loaded[channel] = true;
					else delete scope.loaded[channel];
				}, show? 1300 : 3000);
			};

			/**
			 * Hide the exiting channel first, then remove it from DOM.
			 * Removing it immediately uses too much CPU
			 * @param {string} channel
			 */
			scope.hideTemporarily = function(channel) {
				scope.hidden[channel] = true;
				$timeout(function() {
					delete scope.hidden[channel];
				}, 1500)
			};

			function clickTab(index) {
				element.find('md-tab-item').eq(index).click();
			}

			function currChannel() {
				return settings.channels[settings.selectedTabIndex];
			}
		}
	} 
});