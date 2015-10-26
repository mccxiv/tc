nw.Window.get().showDevTools();

console.log('loading');

angular.module('tc', ['ngMaterial', 'ngSanitize']);

setTimeout(function() {

	//angular.bootstrap(document.querySelector('html'), ['tc']);

}, 2000)

function load() {
	angular.bootstrap(document.querySelector('html'), ['tc']);
}