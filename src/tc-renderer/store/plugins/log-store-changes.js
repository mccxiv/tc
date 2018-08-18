import {autorun} from 'mobx'
import store from '../index'

export default function () {
  setTimeout(() => {
    autorun(
      () => {
        console.info(
          'STORE',
          Object.values(store).map(val => {
            return JSON.parse(JSON.stringify(val))
          })
        )
      }
    )
  }, 1000)
}
