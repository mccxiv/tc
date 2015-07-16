angular.module('tc').directive('addChannel', ['settings', function(settings) {

	function link(scope, element) {
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

		setTimeout(function() {
			element.find('#add-channel-input').focus();
		}, 500);
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/add-channel/add-channel.html',
		link: link
	}
}]);