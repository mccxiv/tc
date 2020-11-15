const electron = require('electron')
const main = electron.remote.getCurrentWindow()

export default function joinChannelFromCommand () {
  electron.remote.process.argv.forEach(function (arg) {
    if (arg.includes('--channel=')) {
      setTimeout(function () {
        main.webContents.send('join-channel', arg.slice(10).replace(/\\/g, ''))
      }, 1500)
    }
  })
}
