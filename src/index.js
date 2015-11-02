var app = require('app');
var ipc = require('ipc');
var path = require('path');
var argv = require('yargs').argv;
var BrowserWindow = require('browser-window');
var startup = require('./assets/squirrel-startup.js');

var DATA_PATH = path.resolve(argv.data || path.resolve(__dirname, './settings'));

var main;

if (startup()) return;
app.setPath('userData', DATA_PATH);
app.on('ready', ready);
ipc.on('open-dev-tools', devTools);
app.on('window-all-closed', app.quit.bind(app));

function ready() {
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

function devTools() {
	main.openDevTools();
}
