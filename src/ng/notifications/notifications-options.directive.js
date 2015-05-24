/**
 * @ngdoc directive
 * @name notificationOptions
 * @restrict E
 */
angular.module('tc').directive('notificationOptions', function(settings) {

	function link(scope) {
		scope.opts = settings.notifications;
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/notifications/notifications-options.directive.html',
		link: link
	}
});