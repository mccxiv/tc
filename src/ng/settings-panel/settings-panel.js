/**
 * Displays the application's options pages
 *
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('settingsPanel', function(settings, gui) {
	function link(scope, element) {
		element.attr('layout', 'row');
		scope.settings = settings;
		scope.m = {
			version: gui.App.manifest.version,
			selected: 0
		};
		scope.items = [
			{name: 'Highlights', html: '<highlights-options></highlights-options>'},
			{name: 'Notifications', html: '<notification-options></notification-options>'},
			{name: 'Chat', html: '<chat-options></chat-options>'}
		];
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/settings-panel/settings-panel.html',
		link: link
	}
});