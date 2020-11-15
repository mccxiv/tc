export default function escape (html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function escapeIrcV3 (string) {
  return String(string)
    .replace(/\\:/g, ';')
    .replace(/\\s/g, ' ')
    .replace(/\\\\/g, '\\')
    .replace(/\\r/g, '')
    .replace(/\\n/g, '')
}
