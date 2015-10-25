/**
 * This piece of code gets executed when loading the application.
 * It contains nwjs setup and behavior.
 */
angular.module('tc').run(function(settings) {
	var win = nw.Window.get();
	var tray = new nw.Tray({ title: 'Tray', icon: 'assets/icon16.png' });
	var menu = new nw.Menu();
	var shown = true;

	menu.append(new nw.MenuItem({
		label: "Exit",
		click: forceClose
	}));
	tray.menu = menu;
	
	if (process.platform === 'darwin') {
		var osxbar = new nw.Menu({type: 'menubar'});
		osxbar.createMacBuiltin('Tc');
		win.menu = osxbar;
	}

	tray.on('click', function() {
		shown = !shown;
		win.show(shown);
	});

	win.on('close', function() {
		if (settings.tray.closeToTray) hide();
		else {
			if (confirm('You will be disconnected from the server')) {
				hide(); // snappier perceived performance
				forceClose();
			}
		}
	});

	win.on('minimize', function() {
		if (settings.tray.minimizeToTray) hide();
	});

	function hide() {
		shown = false;
		win.hide();
	}

	function forceClose() {
		tray.remove();
		win.close(true);
	}
});