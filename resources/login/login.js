angular.module('tc').directive('login', ['settings', function(settings) {
	return {
		restrict: 'E',
		templateUrl: 'resources/login/login.html',
		link: function(scope, element) {
			element.attr('layout', 'row');
			element.attr('layout-align', 'center center');
			scope.username = settings.identity.username;
			scope.password = settings.identity.password;
						
			scope.login = function() {
				console.log('LOGIN: User supplied credentials.');
				settings.identity.username = scope.username;
				settings.identity.password = scope.password;
			}
		}
	}
}]);