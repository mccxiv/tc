angular.module('tc').run(function ($document) {
  if (process.platform === 'darwin') {
    $document.body.style.backgroundColor = '#FDFCFD';
  }
});