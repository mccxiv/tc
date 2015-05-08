/**
 * Chat message filters receive and return an array of these objects.
 * It makes it easier to know which sections of the string should be filtered
 * and which should be left alone.
 * Examples of why this is important:
 * - Avoid converting an emoticon's url to a link
 * - Avoid escaping the html of emoticons and links
 *
 * @typedef {Object} MessagePart
 * @property {string} string - A piece of text that filters could act on
 * @property {isElement} boolean - Filters would probably ignore this message if it's an element
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

	// TODO dry
	var capitalize = $filter('capitalize');
	var emotify = $filter('emotify');
	var linkify = $filter('linkify');
	var escape = $filter('escape');
	var combine = $filter('combine');
	var ffzfy = $filter('ffzfy');
	var messageLimit = 1000;
	var messages = {};

	window.messagesFactory = messages;
	setupIrcListeners();

	function setupIrcListeners() {
		listenGlobal('connecting', 'Connecting...');
		listenGlobal('disconnected', 'Disconnected from the server.');
		listenGlobal('crash', 'IRC crashed! You need to restart the application. Sorry :(');

		irc.addListener('chat', function(channel, user, message) {
			addUserMessage('chat', channel, user, message);
		});

		irc.addListener('action', function(channel, user, message) {
			addUserMessage('action', channel, user, message);
		});

		irc.addListener('connected', function() {
			settings.channels.forEach(function(channel) {
				addNotificationMessage(channel, 'Welcome to '+channel+'\'s chat.');
			});
		});

		irc.addListener('hosting', function(channel, target, viewers) {
			addNotificationMessage(channel, channel + ' is hosting ' + target + ' with ' + viewers + ' viewers.');
		});

		irc.addListener('hosted', function(channel, target, viewers) {
			addNotificationMessage(channel, target + ' is hosting you with ' + viewers + ' viewers.');
		});

		irc.addListener('slowmode', function(channel, enabled, length) {
			var msg;
			if (!enabled) msg = 'This room is no longer in slow mode.';
			else msg = 'This room is now in slow mode. You may send messages every '+length+' seconds.';
			addNotificationMessage(channel, msg);
		});

		irc.addListener('subanniversary', function(channel, username, months) {
			addNotificationMessage(channel, username + ' subscribed for ' + months + ' months in a row!');
		});

		irc.addListener('subscription', function(channel, username) {
			addNotificationMessage(channel, username + ' has just subscribed!');
		});

		irc.addListener('timeout', function(channel, username) {
			addNotificationMessage(channel, username + ' has been timed out.');
		});

		irc.addListener('unhost', function(channel) {
			addNotificationMessage(channel, 'Stopped hosting.');
		});
	}

	/**
	 * Register a listener that will add an identical message to every channel
	 * @param {string} event
	 * @param {string} message
	 */
	function listenGlobal(event, message) {
		irc.addListener(event, function() {
			settings.channels.forEach(function(channel) {
				addNotificationMessage(channel, message);
			});
		})
	}

	/**
	 * Add a user message, types are 'action' or 'chat'
	 * @param {string} type - 'action' or 'chat'
	 * @param {string} channel
	 * @param {object} user - As provided by twitch-irc
	 * @param {string} message
	 */
	function addUserMessage(type, channel, user, message) {
		addMessage(channel, {
			user: user,
			type: type,
			highlighted: highlights.test(message),
			message: combine(escape(linkify(ffzfy(channel, emotify(message, user.emote))))),
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
	 * Adds a message object to the message list
	 * Not used directly, but via helpers
	 * @param {string} channel
	 * @param {object} messageObject
	 */
	function addMessage(channel, messageObject) {
		if (channel.charAt(0) === '#') channel = channel.substring(1);
		if (!messages[channel]) messages[channel] = [];
		messageObject.time = new Date().getTime();
		messages[channel].push(messageObject);

		// Too many messages in memory
		if (messages[channel].length > messageLimit) {
			messages[channel].shift();
		}

		$rootScope.$apply();
	}

	return function(channel) {
		if (!messages[channel]) messages[channel] = [];
		return messages[channel];
	}
});