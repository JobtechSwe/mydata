// const axios = require('axios')
const { JWS, JWE, JWK } = require('@panva/jose')

const read = () => async (connectionId, { domain, area }) => {
  return null
}

const write = (config, keyProvider) => async (connectionId, { domain, area, data }) => {
  // Default domain to clients own
  domain = domain || config.clientId

  // Get signing key for specific domain and area (right now always use clientKey)
  const signingKey = JWK.importKey(await keyProvider.getSigningKey(domain, area))
  const signedData = JWS.sign(data, signingKey)

  const encryptor = new JWE.Encrypt(signedData)

  const writeKeys = (await keyProvider.getWriteKeys(connectionId, domain, area)).map(key => JWK.importKey(key))
  for (let key of writeKeys) {
    encryptor.recipient(key, { kid: key.kid })
  }

  const payload = encryptor.encrypt('general') // Only general serialization allowed for multiple recipients
  
  const token = createWriteDataToken(connectionId, domain, area, payload)


  return null
}

module.exports = ({ config, keyProvider }) => ({
  read: read(),
  write: write(config, keyProvider)
})
