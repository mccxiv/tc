import {reaction} from 'mobx'
import store from '../index'

export default function () {
  reaction(
    () => JSON.stringify(Object.values(store).map(module => module.state)),
    () => {
      console.info(
        'STORE',
        Object.values(store).map(val => {
          return JSON.parse(JSON.stringify(val))
        })
      )
    }
  )
}
