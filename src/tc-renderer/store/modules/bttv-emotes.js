import {settings} from '../../lib/settings/settings'
import {types} from 'mobx-state-tree'

export const Settings = types.model({
  settings: types.frozen(settings)
}).create()
