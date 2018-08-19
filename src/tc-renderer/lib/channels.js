import {reaction} from 'mobx'
import * as R from 'ramda'
import store from '../store'
import {EventEmitter} from 'events'

const settings = store.settings.state
const emitter = new EventEmitter()
const channels = settings.channels
let recentlyRemoved = null

emitter.setMaxListeners(0)
emitter.channels = channels
emitter.current = () => channels[settings.selectedTabIndex]

let oldSelectedTabIndex = settings.selectedTabIndex
let oldChannels = copyAsArray(settings.channels)

reaction(
  () => [settings.selectedTabIndex, settings.channels],
  R.pipe(checkTabChange, checkChannelsChange)
)

function checkTabChange () {
  if (settings.selectedTabIndex !== oldSelectedTabIndex) emitter.emit('change')
  oldSelectedTabIndex = settings.selectedTabIndex
}

function checkChannelsChange () {
  const changes = diff(oldChannels, settings.channels)
  oldChannels = copyAsArray(settings.channels)
  if (!changes.added.length && !changes.removed.length) return

  // Because some operations move channels around, they show up here as
  // remove + add (at a different index). Let's not emit events for that
  changes.removed.forEach(removed => {
    if (!removed) return // Not sure why, some are undefined
    recentlyRemoved = removed
    window.requestAnimationFrame(() => {
      if (!settings.channels.includes(recentlyRemoved)) {
        emitter.emit('remove', removed)
      }
      recentlyRemoved = null
    })
  })
  changes.added.forEach(added => {
    if (added === recentlyRemoved) return
    emitter.emit('add', added)
  })
}

/**
 * String arrays only. Assumes every item is unique.
 *
 * @param oldArr {string[]}
 * @param newArr {string[]}
 * @return {{added: string[], removed: string[]}}
 */
function diff (oldArr, newArr) {
  const added = newArr.filter(n => !oldArr.includes(n))
  const removed = oldArr.filter(o => !newArr.includes(o))
  return {added, removed}
}

/** Because the settings objects are actually Proxies */
function copyAsArray (enumerable) {
  return Array.from(enumerable)
}

export default emitter
