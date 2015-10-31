var app = require('app');
var BrowserWindow = require('browser-window');

var main;

app.on('window-all-closed', function() {
	app.quit();
});

app.on('ready', function() {
	main = new BrowserWindow({
		width: 800,
		height: 450,
		'min-width': 500,
		'min-height': 390
	});

	main.loadUrl('file://' + __dirname + '/index.html');

	main.webContents.openDevTools();

	main.on('closed', function() {
		main = null;
	});
});