module.exports = function () {
  if (process.platform !== 'win32') return false

  let squirrelCommand = process.argv[1]

  if (squirrelCommand) {
    let createShortcut
    let app = require('electron').app
    let path = require('path')
    let execSync = require('child_process').execSync
    let target = path.basename(process.execPath)
    let updateDotExe = path.resolve(
      path.dirname(process.execPath),
      '..',
      'update.exe'
    )

    switch (squirrelCommand) {
      case '--squirrel-install':
        createShortcut = '"' + updateDotExe + '"' + ' --createShortcut="' +
          target + '" --shortcut-locations=Desktop,StartMenu'
        execSync(createShortcut)
        app.quit()
        return true
      case '--squirrel-uninstall':
        createShortcut = updateDotExe +
          ' --removeShortcut="' + target + '"'
        execSync(createShortcut)
        app.quit()
        return true
      case '--squirrel-obsolete':
      case '--squirrel-updated':
        app.quit()
        return true
    }
  }
}
