import Vue from 'vue'
import Vuex from 'vuex'

import {settings} from './modules/settings'

Vue.use(Vuex)

const store = {
  modules: {
    settings
  }
}

export default store
