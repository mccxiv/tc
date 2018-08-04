$.getJSON('https://api.github.com/repos/mccxiv/tc/releases?callback=?', function (response) {
  if (response) {
    $('.release-name').html(response.data[0].name);
    response.data[0].assets.forEach(function(asset) {
      setLink('.tc-osx', '.dmg', asset);
      setLink('.tc-win', '.exe', asset);
      setLink('.tc-linux', '.AppImage', asset);
    });

    for (var i = 0; i < 26; i++) {
      if (response.data[i]) {
        var title = $('<h1>').html(response.data[i].name);
        title.append(' <span class="version">(' + response.data[i].tag_name + ')</span>');
        var body = $('<p>').html(markdownit().render(response.data[i].body));
        $('.changes').append(title).append(body);
      }
    }
  }
});

function setLink(element, contains, asset) {
  if (asset.name.indexOf(contains) > -1) {
    $(element)
      .attr('href', asset.browser_download_url)
      .removeAttr('disabled');
  }
}