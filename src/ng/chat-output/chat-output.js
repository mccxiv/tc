/**
 * Renders a channel's messages
 *
 * @ngdoc directive
 * @name chatOutput
 * @restrict E
 */
angular.module('tc').directive('chatOutput', function($sce, $timeout, settings, messages, session, irc, api) {
	
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
		hideUnscrolledLines();
		handleEmoteHover();

		scope.$watch(
			function() {return scope.messages[scope.messages.length-1]},
			function() {
				if (scope.autoScroll) scrollDown();
				else scope.chatLimit--; // ng-repeat uses negative
			}
		);

		window.addEventListener('resize', function() {
			if (scope.autoScroll) scrollDown();
		});

		window.dfb = distanceFromBottom;

		//===============================================================
		// Directive methods
		//===============================================================
		scope.selectUsername = function(username) {
			console.log('CHAT-OUTPUT: Username selected:', username);
			session.selectedUser = username;
			session.selectedUserChannel = scope.channel;
		};

		scope.isBroadcaster = function(username) {
			return username.toLowerCase() === scope.channel.toLowerCase();
		};

		scope.trusted = function(html) {
			return $sce.trustAsHtml(html);
		};

		scope.scrollDown = scrollDown;

		//===============================================================
		// Functions
		//===============================================================
		function handleEmoteHover() {

			element.on('mouseenter', '.emoticon', function(e) {
				var emoticon = $(e.target);
				var tooltip = emoticon.data('emote-name');
				var description = emoticon.data('emote-description');

				if (description) tooltip += '<br>' + description;
				emoticon.frosty({html: true, content: tooltip});
				emoticon.frosty('show');
				emoticon.one('mouseleave', function() {
					emoticon.frosty('hide');
				})
			});
		}

		/**
		 * Turns autoscroll on and off based on user scrolling,
		 * resets the max lines when autoscroll is turned back on,
		 * shows all lines when scrolling up to the top (infinite scroll)
		 */
		function watchScroll() {
			element.on('scroll', function() {
				if (!latestScrollWasAutomatic) {
					scope.autoScroll = distanceFromBottom() === 0;
					scope.$apply();
				}
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

		function scrollDown() {
			scope.autoScroll = true;
			latestScrollWasAutomatic = true;
			setTimeout(function() {
				console.log('CHAT-OUTPUT: scrolling down automatically');
				element[0].scrollTop = element[0].scrollHeight;
			}, 0);
		}

		function hideUnscrolledLines() {
			element.css({'opacity': 0});
			setTimeout(function() {element.css({'opacity': 1});}, 0);
		}

		function distanceFromTop() {
			return Math.floor(element[0].scrollTop);
		}
		
		function distanceFromBottom() {
			var distance = element[0].scrollHeight - element[0].scrollTop - element[0].offsetHeight;
			return Math.floor(Math.abs(distance));
		}

		function handleAnchorClicks() {
			// TODO any way to get rid of jquery dependency? need event delegation though
			element.on('click', 'a', function(event) {
				event.preventDefault();
				event.stopPropagation();
				console.log('CHAT-OUTPUT: Clicked on a link', event.target.getAttribute('href'));
				nw.Shell.openExternal(event.target.getAttribute('href'));
				return false;
			})
		}

		function fetchBadges(timeout) {
			api.badges(scope.channel).success(function(badges) {
				scope.badges = badges;
			}).error(function() {
				var delay = (timeout || 1000) * 2;
				setTimeout(function() {fetchBadges(delay)}, delay);
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