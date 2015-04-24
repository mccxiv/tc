angular.module('tc').directive('login', ['settings', 'irc', function(settings, irc) {
	return {
		restrict: 'E',
		templateUrl: 'ng/login/login.html',
		link: function(scope) {
			scope.irc = irc;
			scope.settings = settings;
			scope.login = function() {
				settings.identity.username = scope.m.username;
				settings.identity.password = scope.m.password;
				console.log('LOGIN: User supplied credentials.', settings.identity.username, settings.identity.password, '|');
				irc.login();
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
}]);