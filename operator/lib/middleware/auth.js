const createError = require('http-errors')
const { createVerify } = require('crypto')
const jwksManager = require('jwks-manager')
const { getKey } = require('../services/getKey')
const schemas = require('../services/schemas')
const { verify, decode } = require('jwt-lite')

const clientsService = require('../services/clients')

const signed = ({ accountKey = false } = {}) => async (req, res, next) => {
  try {
    // Verify schema
    let schema
    if (accountKey) {
      schema = schemas.signedPayloadWithAccountKey
    } else {
      schema = schemas.signedPayloadWithKeyId
    }
    await schema.validate(req.body, schemas.defaultOptions)

    const { data, signature } = req.body

    // Verify algorithm
    const validAlgorithms = ['RSA-SHA256', 'RSA-SHA512']
    if (!validAlgorithms.includes(signature.alg)) {
      throw createError(403, 'Invalid algorithm')
    }

    // Load client
    let client
    if (data.clientId) {
      client = await clientsService.get(data.clientId)
    }

    let verifyKey
    if (accountKey) {
      verifyKey = Buffer.from(data.accountKey, 'base64').toString('utf8')
    } else {
      try {
        const { publicKey, rsaPublicKey } = await jwksManager.getKey(signature.kid)
        verifyKey = publicKey || rsaPublicKey
      } catch (err) {
        throw createError(401, `Could not retrieve key [${signature.kid}]`)
      }
    }

    // Verify signature
    if (!verifyKey) {
      throw createError(400, 'Cannot find signature key')
    }
    if (!createVerify(signature.alg)
      .update(JSON.stringify(data))
      .verify(verifyKey, signature.data, 'base64')) {
      throw createError(403, 'Invalid signature')
    }

    req.body = req.body.data
    req.signature = {
      ...signature,
      client,
      key: verifyKey
    }
    next()
  } catch (error) {
    switch (error.name) {
      case 'ValidationError':
        const errorToReturn = error.message.includes('"clientId" must be a valid uri with a scheme matching the https pattern')
          ? createError(403, 'Unsafe (http) is not allowed')
          : createError(400, error)
        return next(errorToReturn)
      default:
        return next(error)
    }
  }
}

const jwtVerifier = async ({ body }, res, next) => {
  const { jwt } = body

  if (!jwt) {
    throw Error('JWT missing on request')
  }
  const { header } = await decode(jwt)
  const publicKey = await getKey(header.kid)

  try {
    const claimsSet = await verify(jwt, publicKey)
    body.claimsSet = claimsSet
    next()
  } catch (error) {
    console.error('could not verify jwt', error)
    next(error)
  }
}

module.exports = {
  signed,
  jwtVerifier
}
