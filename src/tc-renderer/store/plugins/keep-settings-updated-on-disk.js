import path from 'path'
import electron from 'electron'
import jsonFile from 'jsonfile'
import {reaction} from 'mobx'
import store from '../'

export default function () {
  reaction(
    () => JSON.stringify(store.settings.state),
    saveSettings
  )
}

function saveSettings () {
  jsonFile.writeFileSync(settingsFilePath(), store.settings.state, {spaces: 2})
}

function settingsFilePath () {
  const userData = electron.remote.app.getPath('userData')
  return path.resolve(userData, 'settings.json')
}
