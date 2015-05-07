/**
 * Displays the application's options pages
 *
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('settingsPanel', function(settingsGui, $compile) {

	function main(scope, element) {
		element.attr('layout', 'row');
		scope.m = {selected: 0};
		scope.items = settingsGui.getItems();
		scope.compile = function(html) {
			return $compile(html)(scope);
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/settings-panel/settings-panel.html',
		link: main
	}
});