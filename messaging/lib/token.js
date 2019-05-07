const axios = require('axios')
const schemas = require('./schemas')

async function verifyToken ({ decode, verify, importKey }, token) {
  if (typeof decode !== 'function' || typeof decode !== 'function' || typeof importKey !== 'function') {
    throw new Error('First argument must be a JWT library')
  }
  const { header, payload, signature } = decode(token, { complete: true })
  const { type } = payload
  if (!type) {
    throw new Error('Type missing')
  }
  if (!signature) {
    throw new Error('Signature missing')
  }
  const { kid, jwk } = header
  const isDeviceIssued = schemas.deviceSchemas.includes(schemas[type])

  if (!kid && !isDeviceIssued) {
    throw Error('No signing key (kid)')
  } else if (!jwk && isDeviceIssued) {
    throw Error('No signing key (jwk)')
  }
  if (!schemas[type]) {
    throw new Error('Unknown type')
  }
  await schemas.JOSE_HEADER.validate(header)
  await schemas[type].validate(payload)

  let key
  if (isDeviceIssued) {
    key = importKey(header.jwk)
  } else {
    try {
      const { data } = await axios.get(kid)
      key = importKey(data)
    } catch (error) {
      throw new Error(`No key found for kid: ${kid}`, error)
    }
  }
  if (!key) {
    throw Error('No signing key')
  }
  return verify(token, key, { complete: true })
}

async function createToken ({ sign, decode }, data, key, options) {
  if (!data.type) {
    throw new Error('Payload must have a type')
  }
  if (!schemas[data.type]) {
    throw new Error(`Unknown schema ${data.type}`)
  }
  const token = await sign(data, key, options)
  const { header, payload } = decode(token, { complete: true })
  await schemas.JOSE_HEADER.validate(header)
  await schemas.validate(payload)

  return token
}

module.exports = ({ sign, decode, verify, importKey }) => ({
  verify: (token) => verifyToken({ decode, verify, importKey }, token),
  sign: (payload, key, options) => createToken({ sign, decode }, payload, key, options)
})
