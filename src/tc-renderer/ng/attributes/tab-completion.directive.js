import $ from 'jquery'
import angular from 'angular'

angular.module('tc').directive('tabCompletion', () => {
  function link (scope, element) {
    element = $(element[0]); scope.$on('$destroy', () => element.off())

    let previousKeyWasTab = false
    let words
    let userString
    let matchingItems
    let currentItem

    element.on('keydown', (event) => {
      if (event.which === 9) tabPress(event)
      else previousKeyWasTab = false
    })

    function tabPress (event) {
      event.preventDefault()

      // first time pressing tab, setup state
      if (!previousKeyWasTab) {
        words = element.val().split(' ')
        userString = words[words.length - 1]
        if (userString.length) {
          matchingItems = findMatches()
          currentItem = 0
          previousKeyWasTab = true
        }
      }

      // replace word with next valid match
      if (previousKeyWasTab && matchingItems.length) {
        if (currentItem >= matchingItems.length) currentItem = 0
        words[words.length - 1] = matchingItems[currentItem]
        currentItem++
        element.val(words.join(' ') + ' ')
        angular.element(element).triggerHandler('input')
      }
    }

    function findMatches () {
      return scope.tabCompletionFn().filter((item) => {
        return item.toLowerCase().startsWith(userString.toLowerCase())
      })
    }
  }

  return {
    restrict: 'A',
    scope: {'tabCompletionFn': '&'},
    link: link
  }
})
