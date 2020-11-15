import angular from 'angular'

angular.module('tc').directive('autoFocus', ($timeout) => {
  return {
    link: (s, element) => $timeout(() => element[0].focus(), 300)
  }
})
