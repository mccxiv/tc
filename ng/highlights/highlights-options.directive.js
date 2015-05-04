/**
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('highlightsOptions', function(highlights) {

	function link(scope) {
		scope.m = {input: ''};
		scope.highlights = highlights.get();

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

		function save() {highlights.set(scope.highlights);}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/highlights/highlights-options.directive.html',
		link: link
	}
});