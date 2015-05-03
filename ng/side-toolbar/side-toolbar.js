angular.module('tc').directive('sideToolbar', function(settings, settingsGui, gui, $filter, $mdDialog, irc) {
	
	function link(scope, element) {
		scope.irc = irc;
		scope.settings = settings;
		scope.settingsGui = settingsGui;
		element.attr('layout', 'row');

		scope.connectionStatus = function() {
			var message = 'disconnected';
			if (irc.connected) message = 'connected';
			else if (irc.connecting) message = 'connecting';
			return message;
		};
		
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
		templateUrl: 'ng/side-toolbar/side-toolbar.html',
		link: link
	}
});