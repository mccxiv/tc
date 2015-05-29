/**
 * @ngdoc directive
 * @name hrefExternal
 *
 * @description
 * Reads the href-external attribute and opens the
 * url in the system's default web browser
 */
angular.module('tc').directive('hrefExternal', function(gui) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			element.bind('click', function() {
				var href = attrs.hrefExternal;
				if (!href.startsWith('http://') && !href.startsWith('https://')) {
					href = 'http://'+href;
				}
				gui.Shell.openExternal(href);
			});
		}
	};
});