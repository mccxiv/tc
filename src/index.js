var app = require('app');
var ipc = require('ipc');
var path = require('path');
var Tray = require('tray');
var Menu = require('menu');
var argv = require('yargs').argv;
var BrowserWindow = require('browser-window');
var squirrelStartup = require('./assets/squirrel-startup.js');

var main;
var tray;
var quitting;

if (squirrelStartup()) return; // TODO Shouldn't this be app.quit instead?
if (isSecondInstance()) app.quit();
if (argv['dev-tools']) setTimeout(devTools, 1000);
if (argv.data) app.setPath('userData', path.resolve(argv.data));
app.on('ready', makeWindow);
ipc.on('open-dev-tools', devTools);
ipc.on('enable-auto-start', enableAutoStart);
ipc.on('disable-auto-start', disableAutoStart);
app.on('window-all-closed', app.quit.bind(app));

function makeWindow() {
	main = new BrowserWindow({
		width: 800,
		height: 450,
		'min-width': 500,
		'min-height': 390,
		icon: __dirname + '/assets/icon256.png'
	});

	main.setMenu(null);
	main.loadUrl('file://' + __dirname + '/index.html');
	main.on('close', function(e) {
		//if (!quitting) e.preventDefault();
		main.hide();
	});
}

function devTools() {
	main.openDevTools();
}

function isSecondInstance() {
	return app.makeSingleInstance(secondaryInstanceLaunched);
}

// Called when this is the main instance, and another is launched
function secondaryInstanceLaunched() {
	if (main.isMinimized()) main.restore();
	if (!main.isVisible()) main.show();
	if (!main.isFocused()) main.focus();
}

function enableAutoStart() {
	toggleAutostart(true);
}

function disableAutoStart() {
	toggleAutostart(false);
}

function toggleAutostart(adding) {
	if (process.platform === 'win32') {
		var command = adding? 'createShortcut' : 'removeShortcut';

		var fs = require('fs');
		var path = require('path');
		var execSync = require('child_process').execSync;
		var target = path.basename(process.execPath);
		var updateDotExe = path.resolve(
				path.dirname(process.execPath),
				'..',
				'update.exe'
		);

		var createShortcut = '"' + updateDotExe + '"' +
				' --'+command+'="' + target + '"' +
				' --shortcut-locations=Startup';

		// Check that Update.exe exists, otherwise we're in standalone mode
		fs.stat(updateDotExe, function(err, stats) {
			if (err || !stats.size) console.warn('Update.exe not found.');
			else execSync(createShortcut);
		});

	}
	else console.warn('There is no autostart option for this platform.');
}