angular.module('tc').directive('addChannel', ['settings', function(settings) {

	function link(scope) {
		scope.value = '';
		
		scope.keypress = function(event) {
			if (event.which === 13) {
				var channel = scope.value.trim();
				channel = channel.toLowerCase();
				if (channel.length && settings.channels.indexOf(channel) < 0) {
					settings.channels.push(channel);
					scope.value = '';
				} 
				// TODO give user feedback if invalid, but only on enter
			}
		};
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/add-channel/add-channel.html',
		link: link
	}
}]);