/**
 * @ngdoc directive
 * @name autoFocus
 *
 * @description
 * When set as an attribute on an input, it'll focus
 * it soon after being rendered
 */
angular.module('tc').directive('autoFocus', function() {
	return {
		link: {
			post: function postLink(scope, element) {
				setTimeout(function() {element[0].focus();}, 300);
			}
		}
	}
});