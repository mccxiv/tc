/**
 * @ngdoc directive
 * @name chatOptions
 * @restrict E
 */
angular.module('tc').directive('chatOptions', function(settings) {

	function link(scope) {
		scope.opts = settings.chat;
		scope.ignoreInput = '';

		scope.add = function() {
			var username = scope.ignoreInput;
			if (scope.ignoreInput.length && settings.chat.ignored.indexOf(username) < 0) {
				settings.chat.ignored.push(username);
			}
			scope.ignoreInput = '';
		};

		scope.delete = function(index) {
			settings.chat.ignored.splice(index, 1);
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chat/chat-options.directive.html',
		link: link
	}
});
