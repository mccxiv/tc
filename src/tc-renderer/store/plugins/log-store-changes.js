import {reaction} from 'mobx'
import store from '../index'

export default function () {
  reaction(
    () => JSON.stringify(store.settings),
    () => console.log('Settings change:', store.settings)
  )
}
