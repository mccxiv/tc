angular.module('tc').factory('trayIcon', function (
  settings, $rootScope, electron) {
  console.log('LOAD: tray-icon');

  if (process.platform !== 'win32') return null;
  // This module uses lots of electron specific code
  var Tray = electron.remote.Tray;
  var Menu = electron.remote.Menu;
  var app = electron.remote.app;
  var ipcRenderer = electron.local.ipcRenderer;
  var browserWindow = electron.remote.browserWindow;
  var path = require('path');

  console.log('tray', Tray);

  var tray = new Tray(path.join(__dirname, 'assets/icon16.png'));

  tray.on('clicked', function () {
    // Electron quirk: don't store this browser window in a local variable
    // or it will get garbage collected in some weird and unpredictable way
    browserWindow.getAllWindows()[0].show();
  });

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Run Tc when my computer starts',
      type: 'checkbox',
      checked: settings.behavior.autoStart,
      click: function () {
        settings.behavior.autoStart = !settings.behavior.autoStart;
        setAutoStart();
        $rootScope.$apply();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit Tc',
      click: app.exit.bind(app, 0)
    }
  ]));

  function setAutoStart() {
    var autoStart = settings.behavior.autoStart;
    var command = autoStart ? 'enable-auto-start' : 'disable-auto-start';
    ipcRenderer.send(command);
  }

  return tray;
});