/**
 * Manages the zoom level
 *
 * @ngdoc factory
 * @name zoomManager
 */
angular.module('tc').factory('zoomManager', function($rootScope, $document, settings) {
	console.log('LOAD: zoomManager');

	var remote = require('remote');
	var webFrame = remote.require('web-frame');

	updateZoom();

	$rootScope.$watch(
		function() {return settings.appearance.zoom},
		function(newV, oldV) {if (newV !== oldV) updateZoom();}
	);

	$document.bind('keyup', function(e) {
		if (e.ctrlKey) {
			if (e.which === 107 || e.which === 187) zoomIn();
			if (e.which === 109 || e.which === 189) zoomOut();
		}
	});

	$document.bind('wheel', function(e) {
		if (e.ctrlKey) {
			if (e.originalEvent.deltaY > 0) zoomOut();
			else zoomIn();
		}
	});

	function zoomIn() {
		if (settings.appearance.zoom < 175) {
			settings.appearance.zoom += 5;
			$rootScope.$apply();
		}
	}

	function zoomOut() {
		if (settings.appearance.zoom > 104) {
			settings.appearance.zoom -= 5;
			$rootScope.$apply();
		}
	}

	function updateZoom() {
		webFrame.setZoomFactor(settings.appearance.zoom / 100);
	}

	return null;
});