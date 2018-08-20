import path from 'path'
import electron from 'electron'
import jsonFile from 'jsonfile'
import {getValidatedSettings} from './validate-settings'

const settings = getValidatedSettings(loadSettings())

function loadSettings () {
  let s = {}
  try { s = jsonFile.readFileSync(settingsFilePath()) } catch (e) {}
  return s
}

function settingsFilePath () {
  const userData = electron.remote.app.getPath('userData')
  return path.resolve(userData, 'settings.json')
}

export {settings}
