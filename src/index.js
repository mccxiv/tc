var app = require('electron').app;
var ipc = require('electron').ipcMain;
var path = require('path');
var argv = require('yargs').argv;
var BrowserWindow = require('browser-window');
var squirrelStartup = require('./lib/squirrel-startup.js');
var windowState = require('electron-window-state');

console.log('TC: Starting :D');

var main;

if (squirrelStartup()) return;
if (isSecondInstance()) app.quit();
if (argv['dev-tools']) setTimeout(devTools, 1000);
if (argv.data) app.setPath('userData', path.resolve(argv.data));

app.on('ready', makeWindow);
ipc.on('open-dev-tools', devTools);
ipc.on('enable-auto-start', enableAutoStart);
ipc.on('disable-auto-start', disableAutoStart);
ipc.on('force-quit', app.exit);
app.on('before-quit', app.exit); // Skip the 'close' event
app.on('activate', unhideAppOnMac);

function makeWindow() {
  var mainWinState = windowState({
    defaultWidth: 800,
    defaultHeight: 450
  });

  main = new BrowserWindow({
    x: mainWinState.x,
    y: mainWinState.y,
    width: mainWinState.width,
    height: mainWinState.height,
    'min-width': 500,
    'min-height': 390,
    icon: __dirname + '/assets/icon256.png'
  });

  mainWinState.manage(main);

  main.on('close', function (e) {
    console.log('TC: Window tried closing, hiding it instead.');
    e.preventDefault();
    if (process.platform === 'darwin') app.hide();
    else main.hide();
  });

  main.setMenu(null);
  main.loadURL('file://' + __dirname + '/index.html');
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
    var command = adding ? 'createShortcut' : 'removeShortcut';

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
      ' --' + command + '="' + target + '"' +
      ' --shortcut-locations=Startup';

    // Check that Update.exe exists, otherwise we're in standalone mode
    fs.stat(updateDotExe, function (err, stats) {
      if (err || !stats.size) console.warn('TC: Update.exe not found.');
      else execSync(createShortcut);
    });

  }
  else console.warn('TC: There is no autostart option for this platform.');
}

function unhideAppOnMac() {
  console.log('TC: App activated, unhiding the window.');
  app.show();
}