/**
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('highlightsOptions', function(highlights) {

	function link(scope) {
		scope.highlights = highlights.get();
		scope.m = {
			input: '',
			highlightMe: highlights.highlightMe()
		};

		scope.delete = function(index) {
			scope.highlights.splice(index, 1);
			save();
		};

		scope.add = function() {
			if (scope.m.input.length) {
				scope.highlights.push(scope.m.input);
				save();
			}
			scope.m.input = '';
		};

		scope.changeHighlightMe = function() {
			highlights.highlightMe(scope.m.highlightMe);
		};

		function save() {highlights.set(scope.highlights);}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/highlights/highlights-options.directive.html',
		link: link
	}
});