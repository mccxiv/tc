import electron from 'electron';

let autoUpdater;
const os = process.platform;

if (os !== 'win32' && os !== 'darwin') {
  autoUpdater = {};
  autoUpdater.checkForUpdates = () => {};
  autoUpdater.on = () => {};
}

else {
  autoUpdater = electron.remote.autoUpdater;
  const version = electron.remote.app.getVersion();
  const url = `http://dl.gettc.xyz/update/${os}/${version}`;

  autoUpdater.setFeedURL(url);

  setTimeout(check, 15000);
  setInterval(check, 1000 * 60 * 60 * 23); // Check for updates every 23 hours

  function check() {
    console.log('Checking for updates at ' + url);
    autoUpdater.on('error', handleAutomaticCheckError);
    autoUpdater.checkForUpdates();

    function handleAutomaticCheckError(error) {
      console.warn('Unable to check for updates. ' +
        'You\'re probably running Tc ' +
        'in standalone mode, or the server is down.', error);
    }

    function removeListener() {
      autoUpdater.removeListener('error', handleAutomaticCheckError)
    }

    // For some reason, only one error listener works at a time, so make
    // sure we clean up in case the UI wants to listen to this error elsewhere
    setTimeout(removeListener, 10000);
  }
}

export default autoUpdater;
