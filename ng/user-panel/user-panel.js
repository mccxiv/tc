angular.module('tc').directive('userMenu', ['settings', 'session', 'gui', 'irc', 'api', function(settings, session, gui, irc, api) {

	function link(scope) {

		var noPicSrc = 'assets/img/user404.png';

		scope.m = {
			created: '',
			profilePicSrc: ''
		};

		scope.$watch(
			function() {return session.selectedUser;},
			function() {
				scope.m.created = '';
				scope.m.profilePicSrc = noPicSrc;
				fetchUser();
			}
		);

		scope.amMod = function() {
			return irc.isMod(settings.channels[settings.selectedTabIndex], settings.identity.username);
		};

		scope.userSelectedInThisChannel = function() {
			var selectedChannel = settings.channels[settings.selectedTabIndex];
			return session.selectedUser && session.selectedUserChannel === selectedChannel;
		};

		scope.goToChannel = function() {
			gui.Shell.openExternal('http://www.twitch.tv/'+session.selectedUser);
		};

		scope.sendMessage = function() {
			gui.Shell.openExternal('http://www.twitch.tv/message/compose?to='+session.selectedUser);
		};

		scope.timeout = function(seconds) {
			irc.say(session.selectedUserChannel, '.timeout ' + session.selectedUser + ' ' + seconds);
			scope.close();
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
				scope.m.profilePicSrc = user.logo? user.logo : noPicSrc;
				scope.m.created = user.created_at;
			});
		}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/user-panel/user-panel.html',
		link: link
	}
}]);