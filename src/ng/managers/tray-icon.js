angular.module('tc').factory('trayIcon', function(settings, $rootScope) {
	console.log('LOAD: tray-icon');

	// This module uses lots of electron specific code
	var remote = require('remote').require;
	var Tray = remote('tray');
	var Menu = remote('menu');
	var app = remote('app');
	var path = remote('path');

	var tray = new Tray(path.join(__dirname, 'assets/icon16.png'));

	tray.on('clicked', function() {
		// Electron quirk: don't store this browser window in a local variable
		// or it will get garbage collected in some weird and unpredictable way
		remote('browser-window').getAllWindows()[0].show();
	});

	tray.setContextMenu(Menu.buildFromTemplate([
		{
			label: 'Run Tc when my computer starts',
			type: 'checkbox',
			checked: settings.behavior.autoStart,
			click: function() {
				settings.behavior.autoStart = !settings.behavior.autoStart;
				setAutoStart();
				$rootScope.$apply();
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Quit Tc', click: function() {
				// remote callbacks are not synchronous so it's not possible to
				// call e.preventDefault() from the browser side.
				require('ipc').send('force-quit');
			}
		}
	]));

	function setAutoStart() {
		var autoStart = settings.behavior.autoStart;
		var command = autoStart? 'enable-auto-start' : 'disable-auto-start';
		require('ipc').send(command);
	}

	return tray;
});