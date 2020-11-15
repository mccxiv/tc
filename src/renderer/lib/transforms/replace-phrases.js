import emojis from '../data/emojis'
import replacements from '../data/replacements.json'
import store from '../../store'

const slashRegex = /\/[a-z0-9\-_]+$/i
const colonRegex = /:[a-z0-9\-_]+:/ig

export default function replacePhrases (string) {
  const sources = [replacements, store.settings.state.shortcuts]
  const phrasesAndEmojis = Object.assign({}, emojis, ...sources)
  const phrases = Object.assign({}, ...sources)

  string = string.replace(slashRegex, s => {
    const phrase = s.substring(1).toLowerCase()
    if (phrases[phrase]) return phrases[phrase]
    else return s
  })

  return string.replace(colonRegex, s => {
    const phrase = s.substring(1, s.length - 1).toLowerCase()
    if (phrasesAndEmojis[phrase]) return phrasesAndEmojis[phrase]
    else return s
  })
}
