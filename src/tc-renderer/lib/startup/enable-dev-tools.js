import electron from 'electron';

export default () => {
  document.addEventListener('keyup', function(e) {
    if (e.which === 123) {
      const win = electron.remote.BrowserWindow.getFocusedWindow();
      if (win) win.openDevTools();
    }
  });
}