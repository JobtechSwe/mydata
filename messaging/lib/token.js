const { getKey } = require('./jwks')
const schemas = require('./schemas')

async function verifyToken ({ decode, verify }, token) {
  const { header, claimsSet, signature } = decode(token, { complete: true })
  const { type } = claimsSet
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
  await schemas[type].validate(claimsSet)

  let key
  if (isDeviceIssued) {
    key = header.jwk
  } else {
    key = await getKey(kid)
  }
  if (!key) {
    throw Error('No signing key')
  }
  const payload = await verify(token, key)
  return {
    header: {
      ...header,
      jwk: header.jwk || key
    },
    payload
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

module.exports = ({ sign, decode, verify }) => {
  if (typeof decode !== 'function' || typeof verify !== 'function' || typeof sign !== 'function') {
    throw new Error('First argument must be a JWT library which provides functions decode, verify and sign')
  }

  return {
    verify: (token) => verifyToken({ decode, verify }, token),
    sign: (payload, key, header) => createToken({ sign, decode }, payload, key, header)
  }
}
