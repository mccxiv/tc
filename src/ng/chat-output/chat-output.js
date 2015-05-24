/**
 * Renders a channel's messages
 *
 * @ngdoc directive
 * @name chatOutput
 * @restrict E
 */
angular.module('tc').directive('chatOutput', function($timeout, settings, messages, session, irc, gui, api) {
	
	function link(scope, element) {
		//===============================================================
		// Variables
		//===============================================================
		var latestScrollWasAutomatic = false;
		scope.opts = settings.chat;
		scope.badges = null;
		scope.messages = messages(scope.channel);
		scope.chatLimit = -scope.opts.maxChatLines;
		scope.autoScroll = true;

		//===============================================================
		// Setup
		//===============================================================
		watchScroll();
		fetchBadges();
		handleAnchorClicks();

		scope.$watch(
			function() {return scope.messages[scope.messages.length-1]},
			function() {
				if (scope.autoScroll) scrollDown();
				else scope.chatLimit--; // ng-repeat uses negative
			}
		);

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
		/**
		 * Turns autoscroll on and off based on user scrolling,
		 * resets the max lines when autoscroll is turned back on,
		 * shows all lines when scrolling up to the top (infinite scroll)
		 */
		function watchScroll() {
			element.bind('scroll', function() {
				if (!latestScrollWasAutomatic) scope.autoScroll = distanceFromBottom() === 0;
				latestScrollWasAutomatic = false; // Reset it
				if (scope.autoScroll) scope.chatLimit = -scope.opts.maxChatLines;
				else if (distanceFromTop() === 0) showAllLines();
			});
		}

		/**
		 * Causes ng-repeat to load all chat lines.
		 * Makes sure the scrollbar doesn't jump to the 
		 * top when the new lines are added.
		 */
		function showAllLines() {
			$timeout(function() {
				scope.chatLimit = Infinity;
				var originalBottomDistance = distanceFromBottom();
				$timeout(function() {
					element[0].scrollTop = element[0].scrollHeight - (originalBottomDistance + element[0].offsetHeight);
				});
			}, 30);
		}

		// TODO needs to be called on new messages
		function scrollDown() {
			latestScrollWasAutomatic = true;
			setTimeout(function() {
				element[0].scrollTop = element[0].scrollHeight;
			}, 0);
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

		function fetchBadges() {
			api.badges(scope.channel).success(function(badges) {
				scope.badges = badges;
			});  // TODO handle error
		}
	}
	
	return {
		restrict: 'E',
		templateUrl: 'ng/chat-output/chat-output.html',
		scope: {channel: '='},
		link: link
	} 
});