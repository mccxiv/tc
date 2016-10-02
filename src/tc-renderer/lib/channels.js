import settings, {events} from './settings/settings';
import {EventEmitter} from 'events';

const emitter = new EventEmitter();
const channels = settings.channels;

emitter.setMaxListeners(0);
emitter.channels = channels;
emitter.current = () => channels[settings.selectedTabIndex];

let oldSelectedTabIndex = settings.selectedTabIndex;
let oldChannels = copyAsArray(settings.channels);

events.on('change', () => {
  checkTabChange();
  checkChannelsChange();
});

function checkTabChange() {
  if (settings.selectedTabIndex !== oldSelectedTabIndex) emitter.emit('change');
  oldSelectedTabIndex = settings.selectedTabIndex;
}

function checkChannelsChange() {
  const changes = diff(oldChannels, settings.channels);
  oldChannels = copyAsArray(settings.channels);
  if (!changes.added.length && !changes.removed.length) return;
  emitter.emit('change');
  changes.added.forEach(added => emitter.emit('add', added));
  changes.removed.forEach(removed => emitter.emit('remove', removed));
}

/**
 * String arrays only. Assumes every item is unique.
 *
 * @param oldArr {string[]}
 * @param newArr {string[]}
 * @return {{added: string[], removed: string[]}}
 */
function diff(oldArr, newArr) {
  const added = newArr.filter(n => !oldArr.includes(n));
  const removed = oldArr.filter(o => !newArr.includes(o));
  return {added, removed};
}

/** Because the settings objects are actually Proxies */
function copyAsArray(enumerable) {
  return Array.from(enumerable)
}

export default emitter;