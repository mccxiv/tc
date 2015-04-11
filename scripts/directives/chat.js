angular.module('tc').directive('chat', function() {
	return {
		restrict: 'E',
		templateUrl: 'scripts/directives/chat.html',
		scope: {channel: '='},
		controller: ['$scope', 'settings', 'irc', function($scope, settings, irc) {
			$scope.messages = [];
			$scope.message = '';

			// TODO get channel from another place, not parent scope
			irc.addListener('chat', function (channel, user, message) {
				console.log('msg in directive.');
				console.log('$scope.channel', $scope.channel);
				console.log('channel', channel);
				if (channel === $scope.channel){
					console.log('adding msg to messages because it matched our channel');
					$scope.messages.push({user: user, message: message});
					$scope.$apply();
				}				
			});
		}]
	} 
});