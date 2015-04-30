/**
 * Provides an object whose json representation is automatically
 * saved to disk whenever its properties are modified.
 *
 * @ngdoc factory
 * @name settings
 */
angular.module('tc').factory('settings', ['gui', '$rootScope', function(gui, $rootScope) {
	
	var fse = require('fs-extra');
	var path = require('path');
	var appData = gui.App.dataPath;
	var filename = path.join(appData, 'settings/', 'settings.json');
	var settings = {
		identity: {
			username: '',
			password: ''
		},
		maxChaLines: 80,
		selectedTabIndex: 0,
		channels: []
	};

	// TODO dont' trust file values to be valid and update it with new defaults
	try {settings = fse.readJsonSync(filename);}
	catch (e) {console.info('No saved settings found.');}

	$rootScope.$watch(watchVal, watchListener, true);
	
	function watchVal() {
		return settings;
	}
	
	function watchListener(newV, oldV) {
		if (newV !== oldV) {
			console.log('Settings changed, saving.', settings);
			fse.outputJson(filename, settings, function() {});
		}
	}
	
	// TODO remove debug stuff
	window.settings = settings;	
	
	return settings;
}]);