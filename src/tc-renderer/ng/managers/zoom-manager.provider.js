import angular from 'angular';
import electron from 'electron';
import settings from '../../lib/settings';

angular.module('tc').factory('zoomManager', ($rootScope, $document) => {

  updateZoom();

  $rootScope.$watch(
    () => settings.appearance.zoom,
    (newV, oldV) => {if (newV !== oldV) updateZoom()}
  );

  $document.bind('keyup', (e) => {
    if (e.ctrlKey) {
      if (e.which === 107 || e.which === 187) zoomIn();
      if (e.which === 109 || e.which === 189) zoomOut();
    }
  });

  $document.bind('wheel', (e) => {
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
    electron.webFrame.setZoomFactor(settings.appearance.zoom / 100);
  }

  return null;
});