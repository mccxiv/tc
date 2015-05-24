/**
 * This piece of code gets executed when loading the application.
 * It contains nwjs setup and behavior.
 */
angular.module('tc').run(['gui', function(gui) {
	var win = gui.Window.get();
	var tray = new gui.Tray({ title: 'Tray', icon: 'assets/icon16.png' });
	var shown = true;

	tray.on('click', function() {
		shown = !shown;
		win.show(shown);
	});

	win.on('close', function() {
		if (confirm('You will disconnect from the server'))	{
			win.hide(); // snappier perceived performance
			tray.remove();
			win.close(true);
		}
	});

	/*win.on('minimize', function() {
		shown = false;
		win.hide();
	});*/
}]);