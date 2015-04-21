angular.module('tc').controller('main', ['$scope', 'settings', 'irc', function($scope, settings, irc) {
	window.main = $scope; // TOdo remove
	$scope.settings = settings;
	$scope.needLogin = function() {
		return !irc.credentialsValid() || irc.badLogin; 
	}
}]);