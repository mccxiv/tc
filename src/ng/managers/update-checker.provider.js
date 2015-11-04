/**
 * Checks for updates and downloads them, but does not install them.
 *
 * How to use this module:
 * - Listen for `update-downloaded` event
 * - Then call .quitAndInstall() to install it.
 * - The application will restart on the new version
 *
 * @ngdoc factory
 * @name updateChecker
 */
angular.module('tc').factory('updateChecker', function() {
	console.log('LOAD: updateChecker');

	var autoUpdater = require('remote').require('auto-updater');
	window.autoUpdater = autoUpdater; // TODO remove debugging stuff

	autoUpdater.setFeedUrl('http://auto-update.gettc.xyz');

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

	setTimeout(autoUpdater.checkForUpdates.bind(autoUpdater), 15000);
	setInterval(autoUpdater.checkForUpdates.bind(autoUpdater), 82800000);

	function check() {
		try {autoUpdater.checkForUpdates();}
		catch (e) {console.warn('Could not check for updates');}
	}

	return autoUpdater;
});