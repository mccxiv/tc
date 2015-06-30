/**
 * @typedef {Object} MessagePart
 * @property {string} string - A piece of text that filters could act on
 * @property {isElement} boolean - Filters would probably ignore this message if it's an element
 *
 * @description
 * Chat message filters receive and return an array of these objects.
 * It makes it easier to know which sections of the string should be filtered
 * and which should be left alone.
 * Examples of why this is important:
 * - Avoid converting an emoticon's url to a link
 * - Avoid escaping the html of emoticons and links
 */

/**
 * Provides chat messages for outputting on screen
 *
 * @ngdoc factory
 * @name messages
 * @kind function
 * @param {string} channel
 * @return {object[]} - List of message objects for this channel
 */
angular.module('tc').factory('messages', function($rootScope, $filter, irc, api, highlights, settings) {

	//=====================================================
	// Variables | TODO dry
	//=====================================================
	var capitalize = $filter('capitalize');
	var emotify = $filter('emotify');
	var linkify = $filter('linkify');
	var escape = $filter('escape');
	var combine = $filter('combine');
	var ffzfy = $filter('ffzfy');
	var bttvmotes = $filter('bttvmotes');
	var messageLimit = 500;
	var messages = {};
	var throttledApplySlow = _.throttle(applyLate, 3000);
	var throttledApplyFast = _.throttle(applyLate, 100);

	//=====================================================
	// Setup
	//=====================================================
	setupIrcListeners();

	//=====================================================
	// Public methods
	//=====================================================
	var factoryReturnValue = function getMessages(channel) {
		if (!messages[channel]) make(channel);
		return messages[channel];
	};

	factoryReturnValue.addWhisper = addWhisperMessage;

	//=====================================================
	// Private methods
	//=====================================================
	function setupIrcListeners() {
		listenGlobal('connecting', 'Connecting...');
		listenGlobal('disconnected', 'Disconnected from the server.');
		listenGlobal('crash', 'IRC crashed! You may need to restart the application. Sorry :(');

		irc.on('chat', function(channel, user, message) {
			addUserMessage('chat', channel, user, message);
		});

		irc.on('action', function(channel, user, message) {
			addUserMessage('action', channel, user, message);
		});

		irc.on('connected', function() {
			settings.channels.forEach(function(channel) {
				addNotificationMessage(channel, 'Welcome to '+channel+'\'s chat.');
			});
		});

		irc.on('hosting', function(channel, target) {
			addNotificationMessage(channel, channel.substring(1) + ' is hosting ' + target);
		});

		irc.on('hosted', function(channel, target, viewers) {
			addNotificationMessage(channel, target + ' is hosting you with ' + viewers + ' viewers.');
		});

		irc.on('slowmode', function(channel, enabled, length) {
			var msg;
			if (!enabled) msg = 'This room is no longer in slow mode.';
			else msg = 'This room is now in slow mode. You may send messages every '+length+' seconds.';
			addNotificationMessage(channel, msg);
		});

		irc.on('subanniversary', function(channel, username, months) {
			addNotificationMessage(channel, username + ' subscribed for ' + months + ' months in a row!');
		});

		irc.on('subscription', function(channel, username) {
			addNotificationMessage(channel, username + ' has just subscribed!');
		});

		irc.on('timeout', function(channel, username) {
			addNotificationMessage(channel, username + ' has been timed out.');
		});

		irc.on('unhost', function(channel) {
			addNotificationMessage(channel, 'Stopped hosting.');
		});

		irc.on('whisper', function(from, message) {
			addWhisperMessage(from, settings.identity.username, message);
		});
	}

	/**
	 * Register a listener that will add an identical
	 * notification message to every channel
	 * @param {string} event
	 * @param {string} message
	 */
	function listenGlobal(event, message) {
		irc.on(event, function() {
			settings.channels.forEach(function(channel) {
				addNotificationMessage(channel, message);
			});
		});
	}

	/**
	 * Add a user message, types are 'action' or 'chat'
	 * @param {string} type - 'action' or 'chat'
	 * @param {string} channel
	 * @param {object} user - As provided by twitch-irc
	 * @param {string} message
	 */
	function addUserMessage(type, channel, user, message) {
		//todo figure out the user.special situation
		if (user.special) user.special.reverse();
		channel = channel.substring(1);
		if (!user['display-name']) {
			user['display-name'] = user.username;
		}
		addMessage(channel, {
			user: user,
			type: type,
			highlighted: highlights.test(message),
			message: combine(escape(linkify(bttvmotes(ffzfy(channel, emotify(message, user.emotes)))))),
			style: type === 'action'? 'color: '+user.color : ''
		});
	}

	/**
	 * Adds a message with the 'notification' type
	 * @param {string} channel
	 * @param {string} message
	 */
	function addNotificationMessage(channel, message) {
		addMessage(channel, {
			type: 'notification',
			message: capitalize(escape(message)),
			style: 'color: #999999'
		});
	}

	/**
	 * Adds a message with the 'whisper' type
	 * @param {string} from
	 * @param {string} to
	 * @param {string} message
	 */
	function addWhisperMessage(from, to, message) {
		settings.channels.forEach(function(channel) {
			addMessage(channel, {
				type: 'whisper',
				from: capitalize(from),
				to: capitalize(to),
				message: escape(message),
				style: 'color: #999999'
			});
		});
	}

	/**
	 * Adds a message object to the message list
	 * Not used directly, but via helpers
	 * @param {string} channel
	 * @param {object} messageObject
	 */
	function addMessage(channel, messageObject) {
		if (channel.charAt(0) === '#') channel = channel.substring(1);
		if (!messages[channel]) make(channel);
		messageObject.time = new Date().getTime();
		messages[channel].push(messageObject);
		if (messageObject.user) messages[channel].counter++;

		// Too many messages in memory
		if (messages[channel].length > messageLimit) {
			messages[channel].shift();
		}

		// TODO get rid of this completely, refactor somehow.
		// it makes this service UI aware and feels dirty, but it's
		// a massive performance boost to check and only $apply if
		// the message is for the currently selected channel
		if (channel === settings.channels[settings.selectedTabIndex]) {
			throttledApplyFast();
		}
		else if (messageObject.user) {
			throttledApplySlow();
		}
	}

	/**
	 * Because of inconsistent sync/async APIs
	 * the $apply() operation should be delayed to the next cycle
	 * TODO see if this is a performance issue
	 */
	function applyLate() {
		setTimeout(function() {
			$rootScope.$apply();
		}, 0);
	}

	function make(channel) {
		messages[channel] = [];
		messages[channel].counter = 0;
	}

	return factoryReturnValue;
});