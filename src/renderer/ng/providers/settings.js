import angular from 'angular'
import store from '../../store'

angular.module('tc').constant('settings', store.settings.state)
