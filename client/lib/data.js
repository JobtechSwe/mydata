const axios = require('axios')

const buildUrl = (operatorUrl, domain, area) => {
  const urlParts = [domain, area]
    .filter(p => p)
    .map(p => encodeURIComponent(p))
    .join('/')
  return `${operatorUrl}/api/data/${urlParts}`
}
const buildHeaders = accessToken => ({ 'Authorization': 'Bearer ' + accessToken })

const read = (operatorUrl, accessToken) => async ({ domain, area }) => {
  const url = buildUrl(operatorUrl, domain, area)
  const headers = buildHeaders(accessToken)
  const { data } = await axios.get(url, { headers })
  return data
}

const write = (operatorUrl, accessToken) => async ({ domain, area, data }) => {
  const url = buildUrl(operatorUrl, domain, area)
  const headers = buildHeaders(accessToken)
  await axios.post(url, data, { headers })
}

const auth = operatorUrl => accessToken => ({
  read: read(operatorUrl, accessToken),
  write: write(operatorUrl, accessToken)
})

module.exports = client => ({
  auth: auth(client.config.operator)
})
