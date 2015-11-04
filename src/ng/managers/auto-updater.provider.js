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
	window.autoUpdater = autoUpdater; // TODO remove debugging stuff

	autoUpdater.setFeedUrl('http://gettc.xyz/update');

	autoUpdater.on('checking-for-update', function() {
		console.log("checking-for-update");
	});

	autoUpdater.on('update-available', function() {
		console.log("update-available");
	});

	autoUpdater.on('update-not-available', function() {
		console.log("update-not-available");
	});

	autoUpdater.on('update-downloaded', function() {
		console.log(" update-downloaded");
	});

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