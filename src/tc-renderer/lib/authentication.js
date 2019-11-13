import axios from 'axios'

export async function isChatTokenValid (token) {
  try {
    await axios('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${token}`
      }
    })
    return true
  } catch (e) {
    if (e && e.response && e.response.status === 401) return false
    // For unrecognized errors just play it safe. Otherwise user gets logged out
    // even though maybe this is some random network error.
    return true
  }
}
