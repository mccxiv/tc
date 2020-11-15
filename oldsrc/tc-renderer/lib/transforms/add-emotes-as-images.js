import escape from './escape'
import escapeRegex from 'lodash.escaperegexp'

function makeImg (emote) {
  const meta = `data-emote-name="${emote.emote}" alt="${emote.emote}"`
  return `<img class="emoticon" ${meta} src="${emote.url}">`
}

export default function addEmotesAsImages (message, emotes) {
  emotes.forEach((e) => {
    const escaped = escapeRegex(escape(e.emote))
    const regString = `(?<=(?:^| ))${escaped}(?=(?: |$))(?!(?:[^<]*>))`
    const re = new RegExp(regString, 'g')
    message = message.replace(re, makeImg(e))
  })
  return message
}
