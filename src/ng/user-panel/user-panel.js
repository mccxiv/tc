angular.module('tc').directive('userPanel', function($document, settings, session, gui, irc, api) {

	function link(scope) {
		scope.m = {
			created: '',
			profilePicSrc: ''
		};

		$document.bind('keypress', function(e) {
			if (!session.inputFocused && scope.shouldDisplay()) {
				var character = String.fromCharCode(e.which);
				switch (character) {
					case 'p': scope.purge(); break;
					case 't': scope.timeout(); break;
					case 'b': scope.ban(); break;
				}
			}
		});

		scope.$watch(
			function() {return session.selectedUser;},
			function() {if (session.selectedUser) fetchUser();}
		);

		scope.amMod = function() {
			return irc.isMod(settings.channels[settings.selectedTabIndex], settings.identity.username);
		};

		/**
		 * True when the user was selected in the currently active channel
		 * @returns {boolean}
		 */
		scope.shouldDisplay = function() {
			var selectedChannel = settings.channels[settings.selectedTabIndex];
			return session.selectedUser && session.selectedUserChannel === selectedChannel;
		};

		scope.goToChannel = function() {
			nw.Shell.openExternal('http://www.twitch.tv/'+session.selectedUser);
		};

		scope.sendMessage = function() {
			nw.Shell.openExternal('http://www.twitch.tv/message/compose?to='+session.selectedUser);
		};

		scope.timeout = function(seconds) {
			seconds = seconds || 600;
			irc.say(session.selectedUserChannel, '.timeout ' + session.selectedUser + ' ' + seconds);
			scope.close();
		};

		scope.purge = function() {
			scope.timeout(3);
		};

		scope.ban = function() {
			irc.say(session.selectedUserChannel, '.ban ' + session.selectedUser);
			scope.close();
		};

		scope.close = function() {
			session.selectedUser = null;
			session.selectedUserChannel = null;
		};

		function fetchUser() {
			api.user(session.selectedUser).success(function(user) {
				scope.m.profilePicSrc = user.logo? user.logo : '';
				scope.m.created = user.created_at;
			});
		}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/user-panel/user-panel.html',
		link: link
	}
});