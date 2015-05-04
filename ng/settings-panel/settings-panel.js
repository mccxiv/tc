/**
 * Displays the application's options pages
 *
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('settingsPanel', function(settingsGui, $compile) {

	function main(scope, element) {
		scope.m = {selected: 0};
		scope.items = settingsGui.getItems();
		scope.compile = function(html) {
			return $compile(html)(scope);
			console.log('rendered!');
		};

		element.attr('layout', 'row');

		window.sp = scope;
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/settings-panel/settings-panel.html',
		link: main
	}
});