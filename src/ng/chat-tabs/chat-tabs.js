angular.module('tc').directive('chatTabs', function($timeout, settings, messages) {
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-tabs/chat-tabs.html',
		link: function(scope, element) {
			scope.settings = settings;
			scope.hidden = {};
			scope.loaded = {};
			scope.readUntil = {};
			element.attr('layout', 'column');

			// Wait for chat-outputs to be rendered
			// and select the tab to scroll it into view
			// todo review this
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

			scope.selected = function(channel) {
				load(channel, true);
			};

			scope.deselected = function(channel) {
				load(channel, false);
				hideTemporarily(channel);
				scope.readUntil[channel] = messages(channel).counter;
			};

			/**
			 * Returns how many unread messages a channel has.
			 * @param channel
			 * @returns {string|number} View-ready string such as ' [42]'
			 */
			scope.unread = function(channel) {
				if (currChannel() === channel) return '';
				var unread = messages(channel).counter - (scope.readUntil[channel] || 0);
				if (!unread) return '';
				if (unread > 100) return '*';
				else return unread;
			};

			scope.showingAddChannel = function() {
				return settings.selectedTabIndex === settings.channels.length;
			};

			/**
			 * The chat-output directive should not be shown and hidden immediately
			 * because they it's a very CPU intensive operation, let the animations
			 * run first then do the heavy DOM manipulation.
			 * @param {string} channel
			 * @param {boolean} show
			 */
			function load(channel, show) {
				$timeout(function() {
					// Abort unload operation if the tab to be hidden is selected again
					if (currChannel() === channel && !show) return;
					if (show) scope.loaded[channel] = true;
					else delete scope.loaded[channel];
				}, show? 1300 : 3000);
			}

			/**
			 * Hide the exiting channel first, then remove it from DOM.
			 * Removing it immediately uses too much CPU
			 * @param {string} channel
			 */
			function hideTemporarily(channel) {
				scope.hidden[channel] = true;
				$timeout(function() {
					delete scope.hidden[channel];
				}, 1500);
			}

			function clickTab(index) {
				element.find('md-tab-item').eq(index).click();
			}

			function currChannel() {
				return settings.channels[settings.selectedTabIndex];
			}
		}
	} 
});