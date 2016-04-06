/**
 * Checks for updates and downloads them, but does not install them.
 *
 * How to use this module:
 * - Listen for `update-downloaded` event
 * - Then call .quitAndInstall() to install it.
 * - The application will restart on the new version
 *
 * @ngdoc factory
 * @name autoUpdater
 */
angular.module('tc').factory('autoUpdater', function (electron) {
  console.log('LOAD: autoUpdater');
  var autoUpdater;
  var os = process.platform;

  if (os !== 'win32' && os !== 'darwin') {
    autoUpdater = {};
    autoUpdater.checkForUpdates = function() {};
    autoUpdater.on = function() {};
  }

  else {
    autoUpdater = electron.remote.autoUpdater;
    var version = electron.remote.app.getVersion();
    var url = 'http://dl.gettc.xyz/update';
    url += '?version=' + version;
    url += '&platform=' + process.platform;

    console.log('URL: ', url);

    autoUpdater.setFeedUrl(url);
    //autoUpdater.setFeedUrl('http://localhost/'); // Uncomment For testing

    setTimeout(check, 15000);
    setInterval(check, 1000 * 60 * 60 * 23);

    function check() {
      autoUpdater.checkForUpdates();
    }

    autoUpdater.on('error', function () {
      console.warn('Error when checking for updates.');
    });
  }

  return autoUpdater;
});