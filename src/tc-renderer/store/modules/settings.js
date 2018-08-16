import {nonProxiedSettings} from '../../lib/settings/settings'
import {observable} from 'mobx'

class SettingsStore {
  @observable state = nonProxiedSettings
}

const settingsStore = new SettingsStore()

export {settingsStore}
