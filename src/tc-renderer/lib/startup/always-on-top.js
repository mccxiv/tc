import settings from '../settings/settings'
const electron = require('electron')
var main = electron.remote.getCurrentWindow()

export default function setOnTop() {
  main.setAlwaysOnTop(settings.appearance.alwaysOnTop)
}