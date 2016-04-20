import 'proxy-observe';
import settings from './settings/settings';
import {EventEmitter} from 'events';

const emitter = new EventEmitter();
const channels = settings.channels;

emitter.setMaxListeners(0);
emitter.channels = channels;
emitter.current = () => channels[settings.selectedTabIndex];

Object.observe(settings, (changes) => {
  changes.forEach((change) => {
    if (change.name === 'selectedTabIndex') emitter.emit('change');
  });
});

Array.observe(channels, ([change]) => {
  emitter.emit('change');
  if (change.addedCount) emitter.emit('add', channels[change.index]);
  if (change.removed) {
    change.removed.forEach((removed) => emitter.emit('remove', removed));
  }
});

export default emitter;