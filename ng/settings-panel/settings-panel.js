/**
 * Displays the application's options pages
 *
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('settingsPanel', function(settingsGui) {

	function link(scope, element) {
		scope.m = {selected: 0};
		scope.items = settingsGui.getItems();
		element.attr('layout', 'row');
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/settings-panel/settings-panel.html',
		link: link
	}
});