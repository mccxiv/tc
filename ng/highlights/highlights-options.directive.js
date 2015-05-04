/**
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('highlightsOptions', function(highlights) {

	function link(scope) {
		//scope.hightlights = highlights.get();
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/highlights/highlights-options.directive.html',
		link: link
	}
});