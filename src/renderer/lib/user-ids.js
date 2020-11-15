import { api } from './api'

const cache = {}

export async function usernameToId (username) {
  if (!cache[username]) cache[username] = nonCachingUsernameToId(username)
  return cache[username]
}

async function nonCachingUsernameToId (username) {
  try {
    const response = await api(`users?login=${username}`)
    return response.users[0]._id
  } catch (e) {
    delete cache[username]
    return null
  }
}
