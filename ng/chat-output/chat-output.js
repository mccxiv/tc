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
 * Renders a channel's messages
 *
 * @ngdoc directive
 * @name chatOutput
 * @restrict E
 */
angular.module('tc').directive('chatOutput', function($timeout, $filter, session, irc, gui, api, ffz) {

	// TODO dry
	var capitalize = $filter('capitalize');
	var emotify = $filter('emotify');
	var linkify = $filter('linkify');
	var escape = $filter('escape');
	var combine = $filter('combine');
	var ffzfy = $filter('ffzfy');
	
	function link(scope, element) {
		//===============================================================
		// Variables
		//===============================================================
		var latestScrollWasAutomatic = false;
		scope.autoScroll = true;
		scope.chatLimit = -settings.maxChaLines;
		scope.messages = [];
		scope.badges = null;

		//===============================================================
		// Setup
		//===============================================================
		setupIrcListeners();
		fetchBadges();
		watchScroll();
		handleAnchorClicks();

		scope.$on('$destroy', function() {
			console.warn('CHAT-OUTPUT: Destroying scope');
		});

		//===============================================================
		// Directive methods
		//===============================================================
		scope.selectUsername = function(username) {
			console.log('CHAT-OUTPUT: Username selected:', username);
			session.selectedUser = username;
			session.selectedUserChannel = scope.channel;
		};

		//===============================================================
		// Functions
		//===============================================================
		function setupIrcListeners() {
			addNotificationListener('connecting', 'Connecting...');
			addNotificationListener('connected', 'Welcome to '+scope.channel+'\'s chat.');
			addNotificationListener('disconnected', 'Disconnected from the server.');
			addNotificationListener('crash', 'IRC crashed! You need to restart the client. Sorry :(');
			addChannelListener('chat', addUserMessage);
			addChannelListener('action', addUserMessage);
			addChannelListener('hosting', function(event, target, viewers) {
				addNotificationMessage(scope.channel + ' is hosting ' + target + ' with ' + viewers + ' viewers.');
			});
			addChannelListener('hosted', function(event, target, viewers) {
				addNotificationMessage(target + ' is hosting you with ' + viewers + ' viewers.');
			});
			addChannelListener('slowmode', function(event, enabled, length) {
				var msg;
				if (!enabled) msg = 'This room is no longer in slow mode.';
				else msg = 'This room is now in slow mode. You may send messages every '+length+' seconds.';
				addNotificationMessage(msg);
			});
			addChannelListener('subanniversary', function(event, username, months) {
				addNotificationMessage(username + ' subscribed for ' + months + ' months in a row!');
			});
			addChannelListener('subscription', function(event, username) {
				addNotificationMessage(username + ' has just subscribed!');
			});
			addChannelListener('timeout', function(event, username) {
				addNotificationMessage(username + ' has been timed out.');
			});
			addChannelListener('unhost', function() {
				addNotificationMessage('Stopped hosting.');
			});
		}

		/**
		 * Add a user message to chat, types are 'action' or 'chat'
		 * @param {string} type
		 * @param {object} user - As provided by twitch-irc
		 * @param {string} message
		 */
		function addUserMessage(type, user, message) {
			addMessage({
				user: user,
				type: type,
				message: combine(escape(linkify(ffzfy(scope.channel, emotify(message, user.emote))))),
				style: type === 'action'? 'color: '+user.color : ''
			});
		}

		/**
		 * Adds a message with the 'notification' type
		 * @param {string} message
		 */
		function addNotificationMessage(message) {
			addMessage({
				type: 'notification',
				message: capitalize(escape(message)),
				style: 'color: #999999'
			});
		}

		/**
		 * Adds a message object to chat
		 * Not used directly, but via helpers
		 * @param {object} messageObject
		 */
		function addMessage(messageObject) {
			// increase the limit so that they don't disappear from the top
			// while chat autoscrolling is paused
			if (!scope.autoScroll) scope.chatLimit--;
			scope.messages.push(messageObject);
			$timeout(function() {
				scope.$apply(); // TODO why is this necessary? Don't work without it
				if (scope.autoScroll) autoScroll();
			});
		}
		
		function fetchBadges() {
			api.badges(scope.channel).success(function(badges) {
				scope.badges = badges;
			}); // TODO handle error
		}

		/**
		 * Turns autoscroll on and off based on user scrolling,
		 * resets the max lines when autoscroll is turned back on,
		 * shows all lines when scrolling up to the top (infinite scroll)
		 */
		function watchScroll() {
			element.bind('scroll', function() {
				if (!latestScrollWasAutomatic) scope.autoScroll = distanceFromBottom() === 0;
				latestScrollWasAutomatic = false; // Reset it
				if (scope.autoScroll) scope.chatLimit = -settings.maxChaLines;
				else if (distanceFromTop() === 0) showAllLines();
				scope.$apply();				
			});
		}

		/**
		 * Causes ng-repeat to load all chat lines.
		 * Makes sure the scrollbar doesn't jump to the 
		 * top when the new lines are added.
		 */
		function showAllLines() {
			scope.chatLimit = Infinity;
			var originalBottomDistance = distanceFromBottom();
			$timeout(function() {
				element[0].scrollTop = element[0].scrollHeight - (originalBottomDistance + element[0].offsetHeight);
			});
		}
		
		function autoScroll() {
			latestScrollWasAutomatic = true;
			element[0].scrollTop = element[0].scrollHeight;
		}
		
		function distanceFromTop() {
			return element[0].scrollTop;
		}
		
		function distanceFromBottom() {
			return element[0].scrollHeight - element[0].scrollTop - element[0].offsetHeight;
		}

		function handleAnchorClicks() {
			// TODO any way to get rid of jquery dependency? need event delegation though
			element.on('click', 'a', function(event) {
				event.preventDefault();
				event.stopPropagation();
				console.log('CHAT-OUTPUT: Clicked on a link', event.target.getAttribute('href'));
				gui.Shell.openExternal(event.target.getAttribute('href'));
				return false;
			})
		}

		/**
		 * When `event` happens, put `message` in chat
		 * @param {string} event
		 * @param {string} message
		 */
		function addNotificationListener(event, message) {
			irc.addListener(event, function() {
				addNotificationMessage(message);
			});
		}

		/**
		 * When you only care about responding to events from a particular channel.
		 *
		 * Adds event listener to the irc client that only calls `handler` if the first
		 * parameter of the listener matches `channel`.
		 *
		 * The `handler` will not receive `channel` as first argument, instead,
		 * its first argument will be the event name
		 *
		 * @param {string} event     - Event to listen for
		 * @param {function} handler - Same as twitch-irc but first arg is `event`, not `channel`
		 */
		function addChannelListener(event, handler) {
			irc.addListener(event, function() {
				if (arguments[0] === '#'+scope.channel) {
					// Convert `arguments` to a real array. TODO unnecessary?
					var args = Array.prototype.slice.call(arguments);
					args[0] = event;
					handler.apply(this, args);
				}
			});
		}
	}
	
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-output/chat-output.html',
		scope: {channel: '='},
		link: link
	} 
});