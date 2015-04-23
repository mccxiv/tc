angular.module('tc').directive('addChannel', ['settings', function(settings) {

	function link(scope) {
		scope.value = '';
		
		scope.keypress = function(event) {
			if (event.which === 13) {
				settings.channels.push(scope.value);
				scope.value = '';			
			}
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'resources/add-channel/add-channel.html',
		link: link
	}
}]);