const axios = require('axios')
const { decode } = require('jsonwebtoken')
const {
  generateDocumentKey,
  encryptDocumentKey,
  encryptDocument,
  decryptDocument
} = require('./crypto')

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')

const buildUrl = (operatorUrl, domain, area) => {
  const urlParts = [domain, area]
    .filter(p => p)
    .map(p => encodeURIComponent(p))
    .join('/')
  return `${operatorUrl}/api/data/${urlParts}`
}
const buildHeaders = accessToken => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + accessToken
})

const encrypt = (keyProvider, consentId) => async (domain, area, data) => {
  let aesKey
  let documentKeys = await keyProvider.getDocumentKeys(consentId, domain, area)
  if (!documentKeys) {
    aesKey = await generateDocumentKey()
    const consentKeys = await keyProvider.getAccessKeys(consentId, domain, area)
    documentKeys = consentKeys
      .map(({ kid, publicKey }) => ({
        [kid]: encryptDocumentKey(aesKey, publicKey, 'base64')
      }))
      .reduce((keys, key) => Object.assign(keys, key))
  }
  const cipher = await encryptDocument(aesKey, data, 'base64')
  const doc = `${cipher}\n${jsonToBase64(documentKeys)}`
  return doc
}

const decrypt = (keyProvider, consentId) => async (data) => {
  if (!data) return {}
  const result = {}
  for (let domain of Object.keys(data)) {
    result[domain] = {}
    for (let area of Object.keys(data[domain])) {
      if (!data[domain][area]) {
        result[domain][area] = {}
      } else {
        const [cipher, documentKeys] = data[domain][area].split('\n')
        const consentKeyId = await keyProvider.getConsentKeyId(consentId)
        const aesKey = await keyProvider.getDocumentDecryptionKey(documentKeys, consentKeyId)
        result[domain][area] = decryptDocument(aesKey, cipher)
      }
    }
  }
  return result
}

const read = (operatorUrl, accessToken, decrypt) => async ({ domain, area }) => {
  const url = buildUrl(operatorUrl, domain, area)
  const headers = buildHeaders(accessToken)
  const { data: { data } } = await axios.get(url, { headers })
  return decrypt(data)
}

const write = (operatorUrl, accessToken, encrypt) => async ({ domain, area, data }) => {
  const url = buildUrl(operatorUrl, domain, area)
  const headers = buildHeaders(accessToken)
  const encryptedData = await encrypt(domain, area, data)
  await axios.post(url, { data: encryptedData }, { headers })
}

const auth = (operatorUrl, keyProvider) => accessToken => {
  const { data: { consentId } } = decode(accessToken)
  return {
    read: read(operatorUrl, accessToken, decrypt(keyProvider, consentId)),
    write: write(operatorUrl, accessToken, encrypt(keyProvider, consentId))
  }
}

module.exports = ({ config: { operator }, keyProvider }) => ({
  auth: auth(operator, keyProvider)
})
