nw.Window.get().showDevTools();

console.log('loading');

angular.module('tc', ['ngMaterial', 'ngSanitize']);

setTimeout(function() {

	angular.bootstrap(document.querySelector('html'), ['tc']);

}, 500)

function load() {
	//angular.bootstrap(document.querySelector('html'), ['tc']);
}