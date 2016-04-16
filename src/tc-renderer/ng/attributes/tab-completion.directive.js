import $ from 'jquery';
import angular from 'angular';

angular.module('tc').directive('tabCompletion', function() {

  function link(scope, element) {
    element = $(element[0]);

    var previousKeyWasTab = false;
    var words;
    var userString;
    var matchingItems;
    var currentItem;

    scope.$on('$destroy', element.off.bind(element));

    element.bind('keydown', function(event) {
      if (event.which === 9) tabPress();
      else previousKeyWasTab = false;
    });

    function tabPress() {
      event.preventDefault();

      // first time pressing tab, setup state
      if (!previousKeyWasTab) {
        words = element.val().split(' ');
        userString = words[words.length - 1];
        if (userString.length) {
          matchingItems = findMatches();
          currentItem = 0;
          previousKeyWasTab = true;
        }
      }

      // replace word with next valid match
      if (previousKeyWasTab && matchingItems.length) {
        if (currentItem >= matchingItems.length) currentItem = 0;
        words[words.length - 1] = matchingItems[currentItem];
        currentItem++;
        element.val(words.join(' ') + ' ');
        angular.element(element).triggerHandler('input');
      }
    }

    function findMatches() {
      return scope.tabCompletionFn().filter(function(item) {
        return item.toLowerCase().startsWith(userString.toLowerCase());
      });
    }
  }

  return {
    restrict: 'A',
    scope: {'tabCompletionFn': '&'},
    link: link
  }
});