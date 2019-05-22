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
  const result = verify(token, key, { complete: true })
  return {
    header: {
      ...result.header,
      jwk: key.toJWK(false)
    },
    payload: result.payload
  }
}

async function createToken ({ sign, decode }, data, key, header = {}) {
  if (!data.type) {
    throw new Error('Payload must have a type')
  }
  if (!schemas[data.type]) {
    throw new Error(`Unknown schema ${data.type}`)
  }

  if (!header.kid && !header.jwk) {
    throw new Error(`Header must either have a kid or a jwk`)
  }

  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600

  const token = await sign({ ...data, iat, exp }, key, { ...header, alg: schemas.algs[0] })
  const decodedJwt = decode(token, { complete: true })
  await schemas.JOSE_HEADER.validate(decodedJwt.header)
  await schemas[data.type].validate(decodedJwt.claimsSet)

  return token
}

module.exports = ({ sign, decode, verify, importKey }) => ({
  verify: (token) => verifyToken({ decode, verify, importKey }, token),
  sign: (payload, key, header) => createToken({ sign, decode }, payload, key, header)
})
