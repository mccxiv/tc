/**
 * Lets a user tab through various items on an input field
 * @ngdoc directive
 * @name tabCompletion
 *
 */
angular.module('tc').directive('tabCompletion', function() {
	return {
		restrict: 'A',
		scope: {'tabCompletionFn': '&'},
		link: function(scope, element) {
			var previousKeyWasTab = false;
			var words;
			var userString;
			var matchingItems;
			var currentItem;

			element.bind('keydown', function(event) {
				if (event.which === 9) {
					event.preventDefault();

					// first time pressing tab, set up state
					if (!previousKeyWasTab) {
						words = element.val().split(' ');
						userString = words[words.length-1];
						if (userString.length) {
							matchingItems = scope.tabCompletionFn().filter(function (item) {
								return item.startsWith(userString);
							});
							currentItem = 0;
							previousKeyWasTab = true;
						}
					}

					// replace word with next valid match
					if (previousKeyWasTab && matchingItems.length) {
						if (currentItem >= matchingItems.length) currentItem = 0;
						words[words.length-1] = matchingItems[currentItem];
						currentItem++;
						element.val(words.join(' '));
					}
				}
				else previousKeyWasTab = false;
			});
		}
	}
});