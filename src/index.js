var app = require('app');
var ipc = require('ipc');
var path = require('path');
var Tray = require('tray');
var argv = require('yargs').argv;
var BrowserWindow = require('browser-window');
var startup = require('./assets/squirrel-startup.js');

var DATA_PATH = path.resolve(argv.data || path.resolve(__dirname, './settings'));

var main;
var tray;

if (startup()) return;
app.setPath('userData', DATA_PATH);
app.on('ready', makeWindow);
app.on('ready', makeTray);
ipc.on('open-dev-tools', devTools);
ipc.on('notification', notification);
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
	main.on('closed', function() {
		main = null;
	});
}

function makeTray() {
	tray = new Tray(__dirname + '/assets/icon16.png');
}

function notification(e, obj) {
	if (process.platform === 'win32') tray.displayBalloon(obj);
	else console.warn('Notifications only supported on Windows');
}

function devTools() {
	main.openDevTools();
}
