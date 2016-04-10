angular.module('tc').directive('thumbnail', function (settings, channels, irc, api, openExternal) {

  function link(scope, element) {
    scope.m = {
      img: '',
      channel: null,
      stream: null
    };

    scope.openStream = function () {
      openExternal('http://www.twitch.tv/' + scope.channel() + '/popout');
    };

    load();
    setInterval(load, 60000);
    element.attr('layout', 'column');

    channels.on('change', function () {
      scope.m.stream = null;
      scope.m.channel = null;
      load();
    });

    function getChannel() {
      return settings.channels[settings.selectedTabIndex];
    }

    function load() {
      var channel = getChannel();
      api.channel(channel).success(function (data) {
        scope.m.channel = data;
      });
      api.stream(channel).success(function (data) {
        scope.m.stream = data.stream;
        if (data.stream) {
          var url = data.stream.preview.medium +
            '?' + new Date().getTime();
          preLoadImage(url, function () {
            scope.m.img = url;
            scope.$apply();
          });
        }
      })
    }

    function preLoadImage(url, cb) {
      var img = new Image();
      img.src = url;
      img.addEventListener('load', cb);
    }
  }

  return {
    restrict: 'E',
    templateUrl: 'ng/elements/thumbnail/thumbnail.html',
    link: link
  }
});