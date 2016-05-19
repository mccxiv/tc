const regex = /\S*\w+\.[a-zA-Z]{2,63}\S*/g;

function makeAnchor(url) {
  const original = url;
  if (!/^(http|https):\/\//.test(url)) url = 'http://' + url;
  return `<a href="${url}">${original}</a>`;
}

export default function addLinks(msg) {
  return msg.replace(regex, match => makeAnchor(match));
}
