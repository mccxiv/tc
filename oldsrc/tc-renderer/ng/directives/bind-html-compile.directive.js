import angular from 'angular'

angular.module('tc').directive('bindHtmlCompile', ($compile) => {
  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      scope.$watch(
        () => scope.$eval(attrs.bindHtmlCompile),
        (value) => {
          element.html(value)
          $compile(element.contents())(scope)
        }
      )
    }
  }
})
