/**
 * Provides an object whose json representation is automatically
 * saved to disk whenever its properties are modified.
 *
 * @ngdoc factory
 * @name settings
 */
angular.module('tc').factory('settings', function(gui, $rootScope) {
	//===============================================================
	// Variables
	//===============================================================
	var fse = require('fs-extra');
	var path = require('path');
	var appData = gui.App.dataPath;
	var filename = path.join(appData, 'settings/', 'settings.json');
	var settings = {};
	var defaults = {
		identity: {
			username: '',
			password: ''
		},
		chat: {
			maxChatLines: 120,
			timestamps: false,
			ignored: []
		},
		tray: {
			minimizeToTray: false,
			closeToTray: false
		},
		notifications: {
			onConnect: false,
			onMention: true,
			onWhisper: true,
			soundOnMention: true
		}, // TODO refactor highlights to an object
		theme: {
			dark: false
		},
		appearance: {
			zoom: 100
		},
		selectedTabIndex: 0,
		channels: [],
		highlights: [],
		highlightMe: true
	};

	//===============================================================
	// Initialization
	//===============================================================
	try {settings = fse.readJsonSync(filename);}
	catch (e) {console.info('No saved settings found.');}

	// Watch before applying fixes so that they are saved.
	$rootScope.$watch(watchVal, watchListener, true);
	makeValid(settings);

	//===============================================================
	// Functions
	//===============================================================
	/**
	 * Modifies and returns the input to make sure it's a
	 * valid settings object.
	 * @param {object} s - The settings object to verify and fix
	 */
	function makeValid(s) {
		// TODO this whole thing is dumb, needs refactor

		// TODO this line seems pointless/broken
		if (!angular.isObject(s)) s = angular.copy(defaults);

		if (!angular.isObject(s.identity)) s.identity = angular.copy(defaults.identity);
		if (!angular.isString(s.identity.username)) s.identity.username = defaults.identity.username;
		if (!angular.isString(s.identity.password)) s.identity.password = defaults.identity.password;

		if (!angular.isObject(s.notifications)) s.notifications = angular.copy(defaults.notifications);
		if (typeof s.notifications.onConnect !== 'boolean') s.notifications.onConnect = defaults.notifications.onConnect;
		if (typeof s.notifications.onMention !== 'boolean') s.notifications.onMention = defaults.notifications.onMention;
		if (typeof s.notifications.onWhisper !== 'boolean') s.notifications.onWhisper = defaults.notifications.onWhisper;
		if (typeof s.notifications.soundOnMention !== 'boolean') s.notifications.soundOnMention = defaults.notifications.soundOnMention;

		if (!angular.isObject(s.chat)) s.chat = angular.copy(defaults.chat);
		if (typeof s.chat.timestamps !== 'boolean') s.chat.timestamps = defaults.chat.timestamps;
		if (!angular.isNumber(s.chat.maxChatLines)) s.chat.maxChatLines = defaults.chat.maxChatLines;
		if (!angular.isArray(s.chat.ignored)) s.chat.ignored = defaults.chat.ignored;

		if (!angular.isObject(s.tray)) s.tray = angular.copy(defaults.tray);
		if (typeof s.tray.minimizeToTray !== 'boolean') s.tray.minimizeToTray = defaults.tray.minimizeToTray;
		if (typeof s.tray.closeToTray !== 'boolean') s.tray.closeToTray = defaults.tray.closeToTray;

		if (!angular.isNumber(s.maxChatLines)) s.maxChatLines = defaults.maxChatLines;
		if (!angular.isNumber(s.selectedTabIndex)) s.selectedTabIndex = defaults.selectedTabIndex;
		if (!angular.isArray(s.channels)) s.channels = angular.copy(defaults.channels);
		if (!angular.isArray(s.highlights)) s.highlights = angular.copy(defaults.highlights);
		if (typeof s.highlightMe !== 'boolean') s.highlightMe = defaults.highlightMe;

		if (!angular.isObject(s.theme)) s.theme = angular.copy(defaults.theme);
		if (typeof s.theme.dark !== 'boolean') s.theme.dark = defaults.theme.dark;

		if (!angular.isObject(s.appearance)) s.appearance = angular.copy(defaults.appearance);
		if (!angular.isNumber(s.appearance.zoom)) s.appearance.zoom = defaults.appearance.zoom;

		return s;
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
});
