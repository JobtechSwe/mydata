import axios from 'axios'

export const read = async (accessToken) => {
  const { data } = await axios.get('/api/data', {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  })
  return data
}

export const write = async (accessToken, data) => {
  await axios.post('/api/data', data, {
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    }
  })
}
