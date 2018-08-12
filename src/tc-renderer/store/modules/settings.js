import {settings} from '../../lib/settings/settings'
import {observable} from 'mobx'

console.log('aa', settings)

class SettingsStore {
  @observable state = settings
}

const settingsStore = new SettingsStore()

export {settingsStore}


