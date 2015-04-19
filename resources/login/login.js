angular.module('tc').directive('login', ['settings', function(settings) {
	return {
		restrict: 'E',
		templateUrl: 'resources/login/login.html',
		link: function(scope, element) {
			scope.m = {
				username: settings.identity.username,
				password: settings.identity.password,
				haveUsername: !!settings.identity.username.length
			};
			
			element.attr('layout', 'row');
			element.attr('layout-align', 'center center');
			
			window.login = scope;
						
			scope.login = function() {
				console.log('LOGIN: User supplied credentials.', scope.m.username, scope.m.password, '|');
				settings.identity.username = scope.m.username;
				settings.identity.password = scope.m.password;
			}
		}
	}
}]);