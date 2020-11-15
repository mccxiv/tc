import axios from 'axios'

export default async function getBacklog (
  channel,
  before = Date.now(),
  after = 0,
  limit = 100
) {
  const url = 'https://backlog.gettc.xyz/v1/' + channel
  return (await axios(url, {params: {before, after, limit}})).data
}
