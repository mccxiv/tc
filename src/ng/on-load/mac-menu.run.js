angular.module('tc').run(function (electron) {
  if (process.platform !== 'darwin') return;
  var Menu = electron.remote.Menu;

  var template = [
    {
      label: 'Tc',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() {electron.remote.app.exit(0);}
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    }
  ];

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});