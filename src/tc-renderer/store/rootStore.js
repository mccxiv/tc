import {settingsStore} from './modules/helpers/settings/settings-store'
import {observable} from 'mobx'

class RootStore {
  @observable settings = settingsStore
}

const rootStore = new RootStore()

export default rootStore
