/**
 * This piece of code gets executed when loading the application.
 * It contains nwjs setup and behavior.
 */
angular.module('tc').run(function(gui, settings) {
	var win = gui.Window.get();
	var tray = new gui.Tray({ title: 'Tray', icon: 'assets/icon16.png' });
	var menu = new gui.Menu();
	var shown = true;

	menu.append(new gui.MenuItem({
		label: "Exit",
		click: forceClose
	}));
	tray.menu = menu;

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