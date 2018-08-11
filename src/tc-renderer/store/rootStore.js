import {types} from 'mobx-state-tree'
import {Settings} from './modules/settings'

const rootStore = types.model('root', {
  settings: types.optional(Settings, {})
}).create()

export default rootStore
