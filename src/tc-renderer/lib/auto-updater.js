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

  autoUpdater.setFeedUrl(url);
  //autoUpdater.setFeedUrl('http://localhost/'); // Uncomment For testing

  setTimeout(check, 15000);
  setInterval(check, 1000 * 60 * 60 * 23);

  function check() {
    autoUpdater.checkForUpdates();
  }

  autoUpdater.on('error', () => console.warn('Error checking for updates.'));
}

export default autoUpdater;
