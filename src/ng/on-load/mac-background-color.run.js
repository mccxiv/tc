angular.module('tc').run(function ($document) {
  if (process.platform === 'darwin') {
    $document[0].body.style.backgroundColor = '#FDFCFD';
  }
});