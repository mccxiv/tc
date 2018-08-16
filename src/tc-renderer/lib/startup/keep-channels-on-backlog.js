import getBacklog from '../backlog'
import store from '../../store'

export default function keepChannelsOnBacklog () {
  const twentyThreeHours = 8.28e+7
  setInterval(grabAll, twentyThreeHours)
}

function grabAll () {
  store.settings.state.channels.forEach(c => getBacklog(c))
}
