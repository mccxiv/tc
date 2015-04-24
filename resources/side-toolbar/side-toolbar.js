angular.module('tc').directive('sideToolbar', ['settings', 'gui', '$filter', '$mdDialog', 'irc', function(settings, gui, $filter, $mdDialog, irc) {
	
	function link(scope, element) {
		scope.settings = settings;
		element.attr('layout', 'row');

		scope.channel = function() {
			return settings.channels[settings.selectedTabIndex]
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
			gui.Shell.openExternal('http://www.twitch.tv/'+scope.channel+'/popout');
		};

		scope.openChannel = function() {
			gui.Shell.openExternal('http://www.twitch.tv/'+scope.channel);
		};
	}
	
	return {
		restrict: 'E',
		templateUrl: 'resources/side-toolbar/side-toolbar.html',
		link: link
	}
}]);