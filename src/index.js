var app = require('app');
var ipc = require('ipc');
var path = require('path');
var Tray = require('tray');
var Menu = require('menu');
var argv = require('yargs').argv;
var BrowserWindow = require('browser-window');
var startup = require('./assets/squirrel-startup.js');

var main;
var tray;
var quitting;

if (startup()) return;
if (argv['dev-tools']) setTimeout(devTools, 1000);
if (argv.data) app.setPath('userData', path.resolve(argv.data));
app.on('ready', makeWindow);
app.on('ready', makeTray);
ipc.on('open-dev-tools', devTools);
ipc.on('notification', notification);

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
		if (!quitting) e.preventDefault();
		main.hide();
	});
}

function makeTray() {
	tray = new Tray(__dirname + '/assets/icon16.png');
	tray.on('clicked', main.show.bind(main));
	tray.setContextMenu(Menu.buildFromTemplate([
		{label:'Quit Tc', click: function() {
			quitting = true;
			app.quit();
		}}
	]));
}

function notification(e, obj) {
	if (process.platform === 'win32') tray.displayBalloon(obj);
	else console.warn('Notifications only supported on Windows');
}

function devTools() {
	main.openDevTools();
}
