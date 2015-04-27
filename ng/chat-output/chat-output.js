/**
 * Chat message filters receive and return an array of these objects.
 * It makes it easier to know which sections of the string should be filtered
 * and which should be left alone.
 * Examples of why this is important:
 * - Avoid converting an emoticon's url to a link
 * - Avoid escaping the html of emoticons and links *
 * @typedef {Object} MessagePart
 * @property {string} string - A piece of text that filters could act on
 * @property {isElement} boolean - Filters would probably ignore this message if it's an element
 */

angular.module('tc').directive('chatOutput', ['$timeout', '$filter', 'irc', 'gui', 'badges', function($timeout, $filter, irc, gui, badges) {
	
	var emotify = $filter('emotify');
	var linkify = $filter('linkify');
	var escape = $filter('escape');
	var combine = $filter('combine');
	
	function link(scope, element) {
		var latestScrollWasAutomatic = false;
		scope.autoScroll = true;
		scope.chatLimit = -settings.maxChaLines;
		scope.messages = [];
		scope.badges = null;

		addChannelListener(irc, 'chat', scope.channel, addMessage);
		addChannelListener(irc, 'action', scope.channel, addMessage);
		fetchBadges();
		watchScroll();
		handleAnchorClicks();

		scope.$on('$destroy', function() {
			console.warn('CHAT-OUTPUT: Destroying scope');
		});
		
		function addMessage(event, user, message) {
			// increase the limit so that they don't disappear from the top
			// while chat autoscrolling is paused
			if (!scope.autoScroll) scope.chatLimit--;
			scope.messages.push({
				user: user,
				type: event,
				messageHtml: combine(escape(linkify(emotify(message, user.emote)))),
				messageCss: event === 'action'? 'color: '+user.color : ''
			});
			$timeout(function() {
				scope.$apply(); // TODO why is this necessary? Don't work without it
				if (scope.autoScroll) autoScroll();
			});
		}
		
		function fetchBadges() {
			badges(scope.channel).success(function(badges) {
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
	}

	/**
	 * When you only care about responding to events from a particular channel.
	 * 
	 * Adds event listener to `client` that only calls `handler` if the first 
	 * parameter of the listener matches `channel`.
	 * 
	 * The `handler` will not receive `channel` as first argument, instead,
	 * its first argument will be the event name
	 * 
	 * @param {Object} client      - Object to listen on, has .addListener method
	 * @param {String} event       - Event to listen for
	 * @param {String} channel     - Ignore events from channels other than this one
	 * @param {Function} handler   - Same as twitch-irc but first arg is `event`, not `channel`
	 */
	function addChannelListener(client, event, channel, handler) {
		client.addListener(event, function() {
			if (arguments[0] === '#'+channel) {
				// Convert `arguments` to a real array. TODO unnecessary?
				var args = Array.prototype.slice.call(arguments);
				args[0] = event;
				handler.apply(this, args);
			}
		});
	}
	
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-output/chat-output.html',
		scope: {channel: '='},
		link: link
	} 
}]);