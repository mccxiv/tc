angular.module('tc').directive('login', function(settings, irc, gui) {
	return {
		restrict: 'E',
		templateUrl: 'ng/login/login.html',
		link: function(scope) {
			scope.irc = irc;
			scope.settings = settings;

			scope.login = function() {
				settings.identity.username = scope.m.username;
				settings.identity.password = scope.m.password;
				console.log('LOGIN: User supplied credentials.', settings.identity.username, settings.identity.password);
			};

			scope.generate = function() {
				gui.Shell.openExternal('http://twitchapps.com/tmi/');
			};

			// These values should NOT update the settings object or
			// it will break the form's conditionals
			scope.m = {};
			scope.m.username = settings.identity.username;
			scope.m.password = settings.identity.password;
			scope.m.haveUsername = !!settings.identity.username.length;
			scope.m.haveNoPassword = !settings.identity.password.length;		
		}
	}
});