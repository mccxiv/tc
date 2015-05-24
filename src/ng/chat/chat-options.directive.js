/**
 * @ngdoc directive
 * @name chatOptions
 * @restrict E
 */
angular.module('tc').directive('chatOptions', function(settings) {

	function link(scope) {
		scope.opts = settings.chat;
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/chat/chat-options.directive.html',
		link: link
	}
});