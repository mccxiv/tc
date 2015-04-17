angular.module('tc').controller('main', ['$scope', 'settings', function($scope, settings) {
	$scope.settings = settings;
}]);