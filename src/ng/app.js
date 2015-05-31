angular.module('tc', ['ngMaterial', 'ngSanitize']);

$('body').on('keyup', function(e) {
	if (e.which === 123) {
		require('nw.gui').Window.get().showDevTools();
	}
});