import electron from 'electron'

let autoUpdater
const os = process.platform

if (os !== 'win32' && os !== 'darwin') {
  autoUpdater = {}
  autoUpdater.checkForUpdates = () => {}
  autoUpdater.on = () => {}
} else {
  autoUpdater = electron.remote.autoUpdater
  const version = electron.remote.app.getVersion()
  const url = `http://dl.gettc.xyz/update/${os}/${version}`

  try { autoUpdater.setFeedURL(url) } catch (e) { console.warn('autoUpdater error:', e) }

  const checkWithParams = () => check(autoUpdater, url)

  setTimeout(checkWithParams, 15000)
  setInterval(checkWithParams, 1000 * 60 * 60 * 23) // Check every 23 hours
}

function check (autoUpdater, url) {
  console.log('Checking for updates at ' + url)
  autoUpdater.on('error', handleAutomaticCheckError)
  try { autoUpdater.checkForUpdates() } catch (e) { console.warn('Auto-Update synchronous exception:', e) }

  function handleAutomaticCheckError (error) {
    console.warn('Unable to check for updates. ' +
      'You\'re probably running Tc ' +
      'in standalone mode, or the server is down.', error)
  }

  function removeListener () {
    autoUpdater.removeListener('error', handleAutomaticCheckError)
  }

  // For some reason, only one error listener works at a time, so make
  // sure we clean up in case the UI wants to listen to this error elsewhere
  setTimeout(removeListener, 10000)
}

export default autoUpdater
