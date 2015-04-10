var app = require('app');
//var ipc = require('ipc');
var irc = require('twitch-irc');
var BrowserWindow = require('browser-window');

var mainWindow;
var client;

app.on('window-all-closed', quit);
app.on('ready', init);

function init() {
	createWindow();
	setWindowListeners();
	createClient();
	setClientListeners();
	connectIfReady();
}

function connectIfReady() {
	client.connect(); // TODO
}

function createClient() {
	var clientOptions = {
		options: {debug: true},
		channels: ['k3nt0456']
	};
	//noinspection JSPotentiallyInvalidConstructorUsage
	client = new irc.client(clientOptions);
}

function createWindow() {
	var config = {
		'width': 800,
		'min-width': 800,
		'height': 600,
		'min-height': 600,
		'frame': false,
		'use-content-size': true
	};
	mainWindow = new BrowserWindow(config);
	mainWindow.loadUrl('file://' + __dirname + '/../app-ui/app.html');
	mainWindow.openDevTools();
}

function setClientListeners() {
	client.addListener('chat', makeHandler('chat'));
}

function setWindowListeners() {
	mainWindow.on('closed', onWindowClosed);
}

function quit() {
	// TODO this code was copied from the official docs, why no darwin?
	if (process.platform != 'darwin') app.quit();
}

function makeHandler(eventName) {
	// switch for node side handling goes here
	return function() {

		console.log('mainWindow.webContents.send', mainWindow.webContents.send);
		console.log('mainWindow.webContents.send.apply', mainWindow.webContents.send.apply);
		var sendArgs = [eventName];
		for (var i = 0; i < arguments.length; i++) {
			sendArgs.push(arguments[i]);
		}
		mainWindow.webContents.send.apply(mainWindow.webContents, sendArgs);
	}
}

//============================================================================
// Handlers
//============================================================================

function onWindowClosed() {
	console.warn('NYI');
}