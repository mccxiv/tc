import store from '../'
import jsonFile from 'jsonfile'
import {reaction} from 'mobx'
import {settingsFilePath} from '../modules/settings/settings-file-path'

export default function () {
  reaction(
    () => JSON.stringify(store.settings.state),
    saveSettings
  )
}

function saveSettings () {
  jsonFile.writeFileSync(settingsFilePath, store.settings.state, {spaces: 2})
}
