/**
 * Open dev tools on F12
 */
angular.module('tc').run(function($rootElement) {
	$rootElement.on('keyup', function(e) {
		if (e.which === 123) {
			nw.Window.get().showDevTools();
		}
	});
});