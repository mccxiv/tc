import {settings} from './load-settings-from-disk'
import {observable} from 'mobx'

class SettingsStore {
  @observable state = settings
}

const settingsStore = new SettingsStore()

export {settingsStore}
