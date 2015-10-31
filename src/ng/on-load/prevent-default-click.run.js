/**
 * Middle mouse clicks on a tags cause nwjs to navigate
 * away from the app. Stop this behavior.
 */
angular.module('tc').run(function($rootElement) {
	$rootElement.bind('click', function(e) {
		e.preventDefault();
	});
});