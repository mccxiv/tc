angular.module('tc').directive('channelPanel', ['settings', 'gui', '$filter', '$mdDialog', 'irc', function(settings, gui, $filter, $mdDialog, irc) {
	
	function link(scope) {
		scope.settings = settings;

		scope.channel = function() {
			return settings.channels[settings.selectedTabIndex]
		};

		scope.broadcaster = function () {
			return $filter('stripHash')(scope.channel());
		};
		
		scope.confirmLogout = function(event) {
			var confirm = $mdDialog.confirm()
				.parent(angular.element(document.body))
				//.title('llll')
				.content('Are you sure you want to log out? You will need to re-enter your password.')
				.ok('OK')
				.cancel('Cancel')
				.targetEvent(event);
			confirm._options.clickOutsideToClose = true;
			
			console.log('confirm is ', confirm);

			$mdDialog.show(confirm).then(function() {
				settings.identity.password = '';
				irc.logout();
			}, function() {
				// do nothing
			});
		};

		scope.leave = function() {	
			settings.channels.splice(settings.selectedTabIndex, 1);
			// TODO call $apply?
		};

		scope.openStream = function() {
			gui.Shell.openExternal('http://www.twitch.tv/'+scope.broadcaster()+'/popout');
		};

		scope.openChannel = function() {
			gui.Shell.openExternal('http://www.twitch.tv/'+scope.broadcaster());
		};
	}
	
	return {
		restrict: 'E',
		templateUrl: 'resources/channel-panel/channel-panel.html',
		link: link
	}
}]);