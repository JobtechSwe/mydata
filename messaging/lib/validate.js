const axios = require('axios')
const schemas = require('../lib/schemas')

async function validate ({ decode, verify, parseKey }, token) {
  if (typeof decode !== 'function' || typeof decode !== 'function' || typeof parseKey !== 'function') {
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
    key = parseKey(header.jwk)
  } else {
    try {
      const { data } = await axios.get(kid)
      key = parseKey(data)
    } catch (error) {
      throw new Error(`No key found for kid: ${kid}`, error)
    }
  }
  if (!key) {
    throw Error('No signing key')
  }
  return verify(token, key, { complete: true })
}

module.exports = validate
