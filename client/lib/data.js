const { JWS, JWE, JWK } = require('@panva/jose')
const { verify } = require('./jwt')

const read = (config, keyProvider, tokens) => async (connectionId, { domain, area }) => {
  // Default domain to clients own
  domain = domain || config.clientId

  // Send token to operator
  const token = await tokens.createReadDataToken(connectionId, domain, area)
  const responseToken = await tokens.send(`${config.operator}/api`, token)

  // Parse the response token
  const { payload: { data } } = await verify(responseToken)

  // If no data, return undefined
  if (!data) {
    return undefined
  }

  // Find the correct decryption key
  const rxServiceKey = new RegExp(`^${config.jwksURI}/`)
  const decryptionKeyId = data.recipients
    .map((recipient) => recipient.header.kid)
    .find((kid) => rxServiceKey.test(kid))
  const decryptionKey = await keyProvider.getKey(decryptionKeyId)

  // Use the key to decrypt the content
  const decrypted = JWE.decrypt(data, JWK.importKey(decryptionKey))
  const jws = decrypted.toString('utf8')

  // TODO: Verify the signature
  const [, content] = jws.split('.')
  const clearText = Buffer.from(content, 'base64').toString('utf8')

  return JSON.parse(clearText)
}

const write = (config, keyProvider, tokens) => async (connectionId, { domain, area, data }) => {
  // Default domain to clients own
  domain = domain || config.clientId

  // Get signing key for specific domain and area (right now always use clientKey)
  const signingKey = JWK.importKey(await keyProvider.getSigningKey(domain, area))
  const signedData = JWS.sign(JSON.stringify(data), signingKey, { kid: signingKey.kid })

  const encryptor = new JWE.Encrypt(signedData)

  const permissionJWKS = await keyProvider.getWriteKeys(domain, area)
  const writeKeys = permissionJWKS.keys.map((key) => JWK.importKey(key))
  for (let key of writeKeys) {
    encryptor.recipient(key, { kid: key.kid })
  }

  const payload = encryptor.encrypt('general') // Only general serialization allowed for multiple recipients

  const token = await tokens.createWriteDataToken(connectionId, domain, area, payload)
  const result = await tokens.send(`${config.operator}/api`, token)
  return result
}

const auth = (config, keyProvider, tokens) => (token) => {
  return {
    read: async (options) => {
      const { payload: { sub } } = await verify(token)
      return read(config, keyProvider, tokens)(sub, options)
    },
    write: async (options) => {
      const { payload: { sub } } = await verify(token)
      return write(config, keyProvider, tokens)(sub, options)
    }
  }
}

module.exports = ({ config, keyProvider, tokens }) => ({
  read: read(config, keyProvider, tokens),
  write: write(config, keyProvider, tokens),
  auth: auth(config, keyProvider, tokens)
})
