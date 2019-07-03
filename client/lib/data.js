// const axios = require('axios')
const { JWS, JWE, JWK } = require('@panva/jose')

const read = () => async (connectionId, { domain, area }) => {
  return null
}

const write = (config, keyProvider, tokens) => async (connectionId, { domain, area, data }) => {
  // Default domain to clients own
  domain = domain || config.clientId

  console.log('sign data')
  // Get signing key for specific domain and area (right now always use clientKey)
  const signingKey = JWK.importKey(await keyProvider.getSigningKey(domain, area))
  const signedData = JWS.sign(JSON.stringify(data), signingKey)

  const encryptor = new JWE.Encrypt(signedData)

  console.log('add recipients')
  const permissionJWKS = await keyProvider.getWriteKeys(domain, area)
  const writeKeys = permissionJWKS.keys.map((key) => JWK.importKey(key))
  for (let key of writeKeys) {
    encryptor.recipient(key, { kid: key.kid })
  }

  console.log('encrypt data')
  const payload = JSON.stringify(encryptor.encrypt('general')) // Only general serialization allowed for multiple recipients

  console.log('create token')
  const token = await tokens.createWriteDataToken(connectionId, domain, area, payload)
  console.log(token)
  console.log('send to operator')
  const result = await tokens.send(`${config.operator}/api`, token)
  return result
}

module.exports = ({ config, keyProvider, tokens }) => ({
  read: read(),
  write: write(config, keyProvider, tokens)
})
