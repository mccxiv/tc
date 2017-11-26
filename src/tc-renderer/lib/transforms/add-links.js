// Regex taken from From Night's BTTV
// https://github.com/night/BetterTTV/
import unescape from './unescape'

const regex = /(?:https?:\/\/)?(?:[-a-zA-Z0-9@:%_+~#=]+\.)+[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&;//=()]*)/gi

export default function addLinks (message) {
  return message.replace(regex, function (e) {
    if (e.indexOf('@') > -1 &&
          (e.indexOf('/') === -1 ||
          e.indexOf('@') < e.indexOf('/'))) {
      return '<a href="mailto:' + e + '">' + e + '</a>'
    }
    const unescaped = unescape(e)
    const link = unescaped.replace(/^(?!(?:https?:\/\/|mailto:))/i, 'http://')
    return `<a href="${link}" target="_blank">${e}</a>`
  })
}
