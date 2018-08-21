import jsonFile from 'jsonfile'
import {settingsFilePath} from './settings-file-path'
import {getValidatedSettings} from './validate-settings'

const settings = getValidatedSettings(loadSettings())

function loadSettings () {
  try {
    return jsonFile.readFileSync(settingsFilePath)
  } catch (e) { return {} }
}

export {settings}
