/**
 * @ngdoc directive
 * @name autoFocus
 *
 * @description
 * When set as an attribute on an input, it'll focus
 * it right after being rendered
 */
angular.module('tc').directive('autoFocus', function() {
	return {
		link: {
			post: function postLink(scope, element) {
				element[0].focus();
			}
		}
	}
});