import electron from 'electron'
import $ from 'jquery'
import store from '../../store'
import {reaction} from 'mobx'

export default function watchZoomChanges () {
  updateZoom()
  reaction(() => store.settings.state.appearance.zoom, updateZoom)

  $(document).on('keyup', (e) => {
    if (e.ctrlKey && !e.altKey) { // Check to avoid Alt Gr
      if (e.which === 107 || e.which === 187) zoomIn()
      else if (e.which === 109 || e.which === 189) zoomOut()
      else if (e.which === 48) zoomReset()
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

function zoomReset () {
  store.settings.state.appearance.zoom = 100
}

function updateZoom () {
  electron.webFrame.setZoomFactor(store.settings.state.appearance.zoom / 100)
}
