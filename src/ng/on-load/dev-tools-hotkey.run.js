angular.module('tc').run(function ($document, electron) {
  $document[0].addEventListener('keyup', function (e) {
    if (e.which === 123) {
      electron.local.ipcRenderer.send('open-dev-tools');
    }
  });
});