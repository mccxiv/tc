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
angular.module('tc').factory('autoUpdater', function() {
	console.log('LOAD: autoUpdater');

	var autoUpdater = require('remote').require('auto-updater');

	autoUpdater.setFeedUrl('http://gettc.xyz/update');
	//autoUpdater.setFeedUrl('http://localhost/'); // Uncomment For testing

	setTimeout(check, 15000);
	setInterval(check, 82800000);

	function check() {
		autoUpdater.checkForUpdates();
	}

	autoUpdater.on('error', function() {
		console.warn('Error when checking for updates.');
	});

	return autoUpdater;
});