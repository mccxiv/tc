import icon16 from '../../../assets/icon16.png'
import icon256 from '../../../assets/icon256.png'
import settings from './../settings/settings'
import electron from 'electron'

let tray
const Tray = electron.remote.Tray
const nativeImage = electron.remote.nativeImage
const Menu = electron.remote.Menu
const app = electron.remote.app
const ipcRenderer = electron.ipcRenderer
const browserWindow = electron.remote.BrowserWindow

export default function setupTrayIcon() {
    switch (process.platform) {
        case 'win32':
            makeTrayIconOnWindows()
            break
        case 'linux':
            makeTrayIconOnLinux()
            break
        default:
            return null
    }
}

function makeTrayIconOnWindows () {
  tray = new Tray(nativeImage.createFromDataURL(icon16))

  tray.on('click', () => browserWindow.getAllWindows()[0].show())

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Run Tc when my computer starts',
      type: 'checkbox',
      checked: settings.behavior.autoStart,
      click: function () {
        settings.behavior.autoStart = !settings.behavior.autoStart
        setAutoStart()
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit Tc',
      click: () => app.quit()
    }
  ]))

  function setAutoStart () {
    const autoStart = settings.behavior.autoStart
    const command = autoStart ? 'enable-auto-start' : 'disable-auto-start'
    ipcRenderer.send(command)
  }
}

function makeTrayIconOnLinux() {
    const main = electron.remote.getCurrentWindow()
    tray = new Tray(nativeImage.createFromDataURL(icon256))

    tray.on('click', () => browserWindow.getAllWindows()[0].show())

    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show Tc',
            click: () => main.show()
        },
        {
            label: 'Quit Tc',
            click: () => app.quit()
        }
    ]))
}

export function getTray () {
  return tray
}
