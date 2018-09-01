let path = require('path')
let app = require('electron').app
let ipc = require('electron').ipcMain
let BrowserWindow = require('electron').BrowserWindow
let squirrelStartup = require('./lib/squirrel-startup.js')
let windowState = require('electron-window-state')

console.log('Tc: Starting :D')

let main
let quittingFromRightClick = false
app.commandLine.appendSwitch('js-flags', '--harmony')

if (squirrelStartup()) app.exit(0)
if (isSecondInstance()) app.exit()
if (process.argv.indexOf('--dev-tools') > 0) setTimeout(devTools, 1500)

app.on('ready', makeWindow)
ipc.on('open-dev-tools', devTools)
ipc.on('enable-auto-start', enableAutoStart)
ipc.on('disable-auto-start', disableAutoStart)
app.on('before-quit', () => quittingFromRightClick = true)
app.on('activate', unhideAppOnMac)

function makeWindow () {
  let mainWinState = windowState({
    defaultWidth: 800,
    defaultHeight: 450
  })

  main = new BrowserWindow({
    show: false,
    x: mainWinState.x,
    y: mainWinState.y,
    width: mainWinState.width,
    height: mainWinState.height,
    'min-width': 160,
    'min-height': 100,
    icon: path.resolve(__dirname, '/assets/icon256.png')
  })

  main.on('ready-to-show', function () {
    setTimeout(function () {
      main.show()
    }, 150)
  })

  mainWinState.manage(main)

  main.on('close', function (e) {
    // As silly as this is, I have not found a better approach to consistently
    // save the window state. Even during graceful shutdowns by the OS,
    // Windows will attempt to close all windows instead of quitting the app
    // process. This results in "hiding it instead" behavior, and then a force
    // quit after that. This is a workaround to make sure the window state is
    // always saved
    mainWinState.saveState(main)

    if (!quittingFromRightClick) {
      console.log('Tc: User closed the window, hiding it instead.')
      e.preventDefault()
      switch (process.platform) {
        case 'win32':
          main.hide()
          break
        case 'darwin':
          app.hide()
          break
        default:
          app.quit()
      }
    } else console.log('Tc: Window closing via app quit, allowing it.')
  })

  main.setMenu(null)
  console.log('starting', __dirname)
  main.loadURL(path.join('file://', __dirname, '/index.html'))
}

function devTools () {
  main.openDevTools()
}

function isSecondInstance () {
  return app.makeSingleInstance(secondaryInstanceLaunched)
}

// Called when this is the main instance, and another is launched
function secondaryInstanceLaunched (argv) {
  if (main.isMinimized()) main.restore()
  if (!main.isVisible()) main.show()
  if (!main.isFocused()) main.focus()

  argv.forEach(function (arg) {
    if (argv.includes('--channel=')) {
      main.webContents.send('join-channel', arg.slice(10))
    }
  })
}

function enableAutoStart () {
  toggleAutostart(true)
}

function disableAutoStart () {
  toggleAutostart(false)
}

function toggleAutostart (adding) {
  if (process.platform === 'win32') {
    let command = adding ? 'createShortcut' : 'removeShortcut'

    let fs = require('fs')
    let path = require('path')
    let execSync = require('child_process').execSync
    let target = path.basename(process.execPath)
    let updateDotExe = path.resolve(
      path.dirname(process.execPath),
      '..',
      'update.exe'
    )

    let createShortcut = '"' + updateDotExe + '"' +
      ' --' + command + '="' + target + '"' +
      ' --shortcut-locations=Startup'

    // Check that Update.exe exists, otherwise we're in standalone mode
    fs.stat(updateDotExe, function (err, stats) {
      if (err || !stats.size) console.warn('Tc: Update.exe not found.')
      else execSync(createShortcut)
    })
  } else console.warn('Tc: There is no autostart option for this platform.')
}

function unhideAppOnMac () {
  console.log('Tc: App activated, unhiding the window.')
  app.show()
}
