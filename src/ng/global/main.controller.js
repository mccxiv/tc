angular.module('tc').controller('main', ['$scope', 'settings', 'session', 'irc', function($scope, settings, session, irc) {
	$scope.session = session;
	$scope.settings = settings;
	$scope.needLogin = function() {
		return !irc.credentialsValid() || irc.badLogin; 
	};
}]);