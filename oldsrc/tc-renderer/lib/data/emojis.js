import emoji from 'emojilib'

const keys = Object.keys(emoji.lib)
const map = {}

keys.forEach(word => map[word] = emoji.lib[word].char)

export default map
