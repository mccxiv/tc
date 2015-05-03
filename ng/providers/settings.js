/**
 * Provides an object whose json representation is automatically
 * saved to disk whenever its properties are modified.
 *
 * @ngdoc factory
 * @name settings
 */
angular.module('tc').factory('settings', ['gui', '$rootScope', function(gui, $rootScope) {
	//===============================================================
	// Variables
	//===============================================================
	var fse = require('fs-extra');
	var path = require('path');
	var appData = gui.App.dataPath;
	var filename = path.join(appData, 'settings/', 'settings.json');
	var settings;
	var defaults = {
		identity: {
			username: '',
			password: ''
		},
		maxChaLines: 80,
		selectedTabIndex: 0,
		channels: [],
		highlights: []
	};

	//===============================================================
	// Initialization
	//===============================================================
	try {settings = fse.readJsonSync(filename);}
	catch (e) {console.info('No saved settings found.');}

	// Watch before applying fixes so that they are saved.
	$rootScope.$watch(watchVal, watchListener, true);
	makeValid(settings);

	window.settings = settings; // TODO remove

	//===============================================================
	// Functions
	//===============================================================
	/**
	 * Modifies and returns the input to make sure it's a
	 * valid settings object.
	 * @param {object} s - The settings object to verify and fix
	 */
	function makeValid(s) {
		if (!angular.isObject(s)) s = angular.copy(defaults);
		if (!angular.isObject(s.identity)) s.identity = angular.copy(defaults.identity);
		if (!angular.isString(s.identity.username)) s.identity.username = defaults.identity.username;
		if (!angular.isString(s.identity.password)) s.identity.password = defaults.identity.password;
		if (!angular.isNumber(s.maxChaLines)) s.maxChatLines = defaults.maxChaLines;
		if (!angular.isNumber(s.selectedTabIndex)) s.selectedTabIndex = defaults.selectedTabIndex;
		if (!angular.isArray(s.channels)) s.channels = angular.copy(defaults.channels);
		if (!angular.isArray(s.highlights)) s.highlights = angular.copy(defaults.highlights);
	}

	function watchVal() {
		return settings;
	}

	function watchListener(newV, oldV) {
		if (newV !== oldV) {
			console.log('Settings changed, saving.', settings);
			fse.outputJson(filename, settings, function() {});
		}
	}
	
	return settings;
}]);