const { sign, verify } = require('./jwt')
const pem2jwk = require('pem-jwk').pem2jwk

const createConnectionRequest = (client, { iss, sid }) => {
  const key = pem2jwk(client.config.clientKeys.privateKey)
  key.kid = `${client.config.jwksUrl}/client_key`

  return sign(
    {
      type: 'CONNECTION_REQUEST',
      aud: iss,
      iss: client.config.clientId,
      sid,
      displayName: client.config.displayName,
      description: client.config.description,
      iconURI: client.config.iconURI
    },
    key,
    {
      kid: key.kid
    }
  )
}

const connectionInitHandler = client => async ({ payload }, res) => {
  const connectionRequest = await createConnectionRequest(client, payload)

  res.setHeader('content-type', 'application/jwt')
  res.write(connectionRequest)
  res.end()
}

const connectionEventHandler = client => async ({ payload }, res) => {
  const { payload: { sub, sid } } = await verify(payload.payload)

  const AUTHENTICATION_ID_PREFIX = 'authentication|>'
  client.keyValueStore.save(`${AUTHENTICATION_ID_PREFIX}${sid}`, sub)

  res.sendStatus(200)
}

module.exports = {
  connectionInitHandler,
  connectionEventHandler,
  createConnectionRequest
}

// const CONNECTION_REQUEST = Joi.object({
//   ...JWT_DEFAULTS,
//   type: 'CONNECTION_REQUEST',
//   permissions: Joi.array().items(Joi.object({
//     ...PERMISSION,
//     key: JWK
//   })).min(1).optional(),
//   sid: Joi.string().uuid({ version: 'uuidv4' }).required(),
//   displayName: Joi.string().required(),
//   description: Joi.string().required(),
//   iconURI: Joi.string().required()
// }).required()
