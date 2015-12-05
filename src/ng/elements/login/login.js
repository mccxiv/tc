angular.module('tc').directive('login', function(settings, irc, openExternal) {
	return {
		restrict: 'E',
		templateUrl: 'ng/elements/login/login.html',
		link: function(scope) {
			scope.irc = irc;
			scope.settings = settings;

			scope.login = function() {
				var password = scope.m.password;
				if (!password.startsWith('oauth:')) password = 'oauth:'+password;
				settings.identity.username = scope.m.username;
				settings.identity.password = password;
				console.log('LOGIN: User supplied credentials.', settings.identity.username, settings.identity.password);
			};

			scope.generate = function() {
				openExternal('http://gettc.xyz/password/');
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