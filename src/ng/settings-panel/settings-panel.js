/**
 * Displays the application's options pages
 *
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('settingsPanel', function(settings, gui, updateChecker) {
	function link(scope, element) {
		element.attr('layout', 'row');
		scope.settings = settings;
		scope.m = {
			version: gui.App.manifest.version,
			selected: 'highlights'
		};
		updateChecker.show();
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/settings-panel/settings-panel.html',
		link: link
	}
});