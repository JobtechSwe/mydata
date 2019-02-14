const axios = require('axios')
const { decode } = require('jsonwebtoken')

const buildUrl = (operatorUrl, domain, area) => {
  const urlParts = [domain, area]
    .filter(p => p)
    .map(p => encodeURIComponent(p))
    .join('/')
  return `${operatorUrl}/api/data/${urlParts}`
}
const buildHeaders = accessToken => ({ 'Authorization': 'Bearer ' + accessToken })

const encrypt = (keyProvider) => async (accessToken, domain, area, data) => {
  const { data: { consentId } } = decode(accessToken)
  const documentKeys = await keyProvider.getDocumentKeys(consentId, domain, area)
  return data
}

const decrypt = (keyProvider) => async (accessToken, domain, area, data) => {
  const { data: { consentId } } = decode(accessToken)
  return data
}

const read = (operatorUrl, accessToken, decrypt) => async ({ domain, area }) => {
  const url = buildUrl(operatorUrl, domain, area)
  const headers = buildHeaders(accessToken)
  const { data } = await axios.get(url, { headers })
  return decrypt(accessToken, domain, area, data)
}

const write = (operatorUrl, accessToken, encrypt) => async ({ domain, area, data }) => {
  const url = buildUrl(operatorUrl, domain, area)
  const headers = buildHeaders(accessToken)
  const encryptedData = await encrypt(accessToken, domain, area, data)
  await axios.post(url, encryptedData, { headers })
}

const auth = (operatorUrl, keyProvider) => accessToken => ({
  read: read(operatorUrl, accessToken, decrypt(keyProvider)),
  write: write(operatorUrl, accessToken, encrypt(keyProvider))
})

module.exports = ({ config: { operator }, keyProvider }) => ({
  auth: auth(operator, keyProvider)
})
