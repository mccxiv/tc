angular.module('tc').directive('streamPanel', function(settings, gui, irc, api) {

	function link(scope, element) {
		scope.api = {
			channel: null,
			stream: null
		};

		load(channel());
		element.attr('layout', 'column');

		scope.$watch(
			function() {return settings.selectedTabIndex;},
			function() {load(channel());}
		);

		function channel() {
			return settings.channels[settings.selectedTabIndex];
		}

		function load(channel) {
			api.channel(channel).success(function(data) {
				scope.api.channel = data;
			});

			api.stream(channel).success(function(data) {
				scope.api.stream = data.stream;
			})
		}
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/stream-panel/stream-panel.html',
		link: link
	}
});