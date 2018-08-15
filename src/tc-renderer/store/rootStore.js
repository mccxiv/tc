import {settingsStore} from './modules/settings'
import {observable} from 'mobx'

class RootStore {
  @observable settings = settingsStore
}

const rootStore = new RootStore()

export default rootStore
