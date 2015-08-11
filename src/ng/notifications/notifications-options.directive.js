/**
 * @ngdoc directive
 * @name notificationOptions
 * @restrict E
 */
angular.module('tc').directive('notificationOptions', function(settings, notifications) {

	function link(scope) {
		scope.opts = settings.notifications;
		scope.soundOnMentionChanged = function() {
			if (scope.opts.soundOnMention) notifications.playSound();
		}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/notifications/notifications-options.directive.html',
		link: link
	}
});