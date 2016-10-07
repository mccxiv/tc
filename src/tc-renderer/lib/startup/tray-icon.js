import icon16 from '../../../assets/icon16.png';
import settings from './../settings/settings';
import electron from 'electron';

let tray;

export default function makeTrayIconOnWindows() {
  if (process.platform !== 'win32') return null;
  const Tray = electron.remote.Tray;
  const nativeImage = electron.remote.nativeImage;
  const Menu = electron.remote.Menu;
  const app = electron.remote.app;
  const ipcRenderer = electron.ipcRenderer;
  const browserWindow = electron.remote.BrowserWindow;
  tray = new Tray(nativeImage.createFromDataURL(icon16));

  tray.on('click', () => browserWindow.getAllWindows()[0].show());

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Run Tc when my computer starts',
      type: 'checkbox',
      checked: settings.behavior.autoStart,
      click: function() {
        settings.behavior.autoStart = !settings.behavior.autoStart;
        setAutoStart();
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
    const autoStart = settings.behavior.autoStart;
    const command = autoStart ? 'enable-auto-start' : 'disable-auto-start';
    ipcRenderer.send(command);
  }
}

export function getTray() {
  return tray;
}