/**
 * Middle mouse clicks on a tags cause nwjs to navigate
 * away from the app. Stop this behavior.
 */
angular.module('tc').run(function ($document, electron) {
  $document[0].addEventListener('keyup', function (e) {
    if (e.which === 123) {
      electron.local.ipcRenderer.send('open-dev-tools');
    }
  });
});