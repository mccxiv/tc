// Note: Needs to come after link recognition.
export default function addImageURLsAsImages (message) {
  const linkFinder = /<a href="([^"]*)" target="_blank">(.*?)<\/a>/
  let newMessage = message
  let matchArray = linkFinder.exec(newMessage)
  if (matchArray) {
	let newLinkText
	const re = /(.*(?:jpg|png|gif|jpeg))$/mg
	let link = matchArray[1]
	if (re.test(link)) {
	  newLinkText = '<img src="' + link.replace('media.giphy.com',
		'media1.giphy.com') + '" alt="' + link + '" class="inlineimg"/>'
	}
	let match = /^https?:\/\/giphy\.com\/gifs\/(.*-)?([a-zA-Z0-9]+)$/mg
	  .exec(link)
	if (match) {
	  let imageUrl = 'https://media1.giphy.com/media/' +
		match[2].split('-').pop() + '/giphy.gif'
	  newLinkText = '<img src="' + imageUrl + '" alt="' + link + 
	    '" class="inlineimg"/>'
	}
	match =
	  /^https?:\/\/(www\.)?(youtu\.be\/|youtube\.com\/watch\?v=)([^&?]+).*$/mg
		.exec(link)
	if (match) {
	  let imageUrl = 'https://img.youtube.com/vi/' + match[3] + '/mqdefault.jpg'
	  newLinkText = '<br/><img src="' + imageUrl + '" alt="' + link + 
	   '" class="inlineimg"/>'
	}
	newMessage = newMessage.replace(matchArray[0],
	  `<a href="${link}" target="_blank">${newLinkText}</a>`)
  }
  return newMessage
}
