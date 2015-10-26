/**
 * Provides an object whose json representation is automatically
 * saved to disk whenever its properties are modified.
 *
 * @ngdoc factory
 * @name settings
 */
angular.module('tc').factory('settings', function($rootScope) {
	console.log('LOAD: settings');

	//===============================================================
	// Variables
	//===============================================================
	var fse = nw.require('fs-extra');
	var path = nw.require('path');

	// TODO Temporary patch, only works on Windows!
	if (nw.process.platform !== 'win32') {
		throw Error('Only works on windows, until dataPath is fixed.');
	}

	console.warn('Using hardcoded appdata path! Fix me asap.');

	var appData = nw.App.dataPath;
	appData = path.join(nw.process.env.LOCALAPPDATA, 'Tc'); // TODO remove

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
			thumbnail: true,
			simpleViewerCount: false,
			sidebarCollapsed: false,
			chatters: true,
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
	console.log('SETTINGS: loading settings file')
	try {settings = fse.readJsonSync(filename);}
	catch (e) {console.info('No saved settings found.');}

	settings = makeValid(settings);
	saveSettings();

	$rootScope.$watch(watchVal, watchListener, true);

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
		if (typeof s.appearance.thumbnail !== 'boolean') s.appearance.thumbnail = defaults.appearance.thumbnail;
		if (typeof s.appearance.simpleViewerCount !== 'boolean') s.appearance.simpleViewerCount = defaults.appearance.simpleViewerCount;
		if (typeof s.appearance.sidebarCollapsed !== 'boolean') s.appearance.sidebarCollapsed = defaults.appearance.sidebarCollapsed;
		if (typeof s.appearance.chatters !== 'boolean') s.appearance.chatters = defaults.appearance.chatters;

		return s;
	}

	function watchVal() {
		return settings;
	}

	function watchListener(newV, oldV) {
		if (newV !== oldV) {
			console.log('Settings changed, saving.', settings);
			saveSettings();
		}
	}

	function saveSettings() {
		fse.outputJson(filename, settings, function() {});
	}

	return settings;
});
