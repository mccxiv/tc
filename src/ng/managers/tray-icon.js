angular.module('tc').factory('trayIcon', function(settings, $rootScope) {
	console.log('LOAD: tray-icon');

	// This module uses lots of electron specific code
	var remote = require('remote').require;
	var Tray = remote('tray');
	var Menu = remote('menu');
	var app = remote('app');
	var path = remote('path');

	var tray = new Tray(path.join(__dirname, 'assets/icon16.png'));
	//tray.on('clicked', main.show.bind(main));
	tray.setContextMenu(Menu.buildFromTemplate([
		{
			label: 'Run Tc when my computer starts',
			type: 'checkbox',
			checked: settings.behavior.autoStart,
			click: function() {
				settings.behavior.autoStart = !settings.behavior.autoStart;
				$rootScope.$apply();
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Quit Tc', click: function() {
				app.quit();
			}
		}
	]));
	return tray;
});