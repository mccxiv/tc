import store from '../../store'
const electron = require('electron')
const main = electron.remote.getCurrentWindow()

export default function setOnTop () {
  main.setAlwaysOnTop(store.settings.state.appearance.alwaysOnTop)
}
