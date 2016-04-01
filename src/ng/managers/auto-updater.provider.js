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
  
  if (process.platform !== 'win32') {
    autoUpdater = {};
    autoUpdater.checkForUpdates = function() {};
    autoUpdater.on = function() {};
  }
  
  else {
    autoUpdater = electron.remote.autoUpdater;
    var version = electron.remote.app.getVersion();
    var os = process.platform;

    //autoUpdater.setFeedUrl('http://gettc.xyz/update');
    autoUpdater.setFeedUrl('http://dl.gettc.xyz/update/' + os + '/' + version);
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