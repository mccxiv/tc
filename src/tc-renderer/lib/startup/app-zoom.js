import electron from 'electron'
import $ from 'jquery'
import {events} from '../../lib/settings/settings'
import store from '../../store'

export default function watchZoomChanges () {
  updateZoom()
  let zoomLevel = store.settings.state.appearance.zoom

  events.on('change', () => {
    if (zoomLevel !== store.settings.state.appearance.zoom) {
      updateZoom()
      zoomLevel = store.settings.state.appearance.zoom
    }
  })

  $(document).on('keyup', (e) => {
    if (e.ctrlKey && !e.altKey) { // Check to avoid Alt Gr
      if (e.which === 107 || e.which === 187) zoomIn()
      if (e.which === 109 || e.which === 189) zoomOut()
    }
  })

  $(document).on('wheel', (e) => {
    if (e.ctrlKey && !e.altKey) { // Check to avoid Alt Gr
      if (e.originalEvent.deltaY > 0) zoomOut()
      else zoomIn()
    }
  })
}

function zoomIn () {
  if (store.settings.state.appearance.zoom < 175) {
    store.settings.state.appearance.zoom += 5
  }
}

function zoomOut () {
  if (store.settings.state.appearance.zoom > 104) {
    store.settings.state.appearance.zoom -= 5
  }
}

function updateZoom () {
  electron.webFrame.setZoomFactor(store.settings.state.appearance.zoom / 100)
}
