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
			enabled: true,
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
	// Execution
	//===============================================================
	settings = makeValid(loadSettings());
	saveSettings();
	$rootScope.$watch(function() {return settings;}, settingsChanged, true);
	return settings;

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
		if (typeof s.tray.enabled !== 'boolean') s.tray.enabled = defaults.tray.enabled;

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

	function settingsChanged(newV, oldV) {
		if (newV !== oldV) {
			console.log('Settings changed, saving.', settings);
			saveSettings();
		}
	}

	function loadSettings() {
		var s = {};
		try {s = JSON.parse(localStorage.settings);}
		catch (e) {console.error('Exception trying to parse settings', e);}
		return s;
	}

	function saveSettings() {
		localStorage.settings = JSON.stringify(settings);
	}
});
