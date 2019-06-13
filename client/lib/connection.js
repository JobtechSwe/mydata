const { sign, verify } = require('./jwt')
const pem2jwk = require('pem-jwk').pem2jwk
const { createPermissions } = require('./permissions')

const createConnectionRequest = async (client, { iss, sid }) => {
  const key = pem2jwk(client.config.clientKeys.privateKey)
  key.kid = `${client.config.jwksUrl}/client_key`

  let permissions
  if (client.config.defaultPermissions) {
    permissions = await createPermissions(client.config, client.keyProvider)
  }

  return sign(
    {
      type: 'CONNECTION_REQUEST',
      aud: iss,
      iss: client.config.clientId,
      sid,
      displayName: client.config.displayName,
      description: client.config.description,
      iconURI: client.config.iconURI,
      permissions
    },
    key,
    {
      kid: key.kid
    }
  )
}

const connectionInitHandler = (client) => async ({ payload }, res, next) => {
  try {
    const connectionRequest = await createConnectionRequest(client, payload)

    res.setHeader('content-type', 'application/jwt')
    res.write(connectionRequest)
    res.end()
  } catch (error) {
    next(error)
  }
}

const connectionEventHandler = (client) => async ({ payload }, res) => {
  const { payload: { sub, sid } } = await verify(payload.payload)

  const AUTHENTICATION_ID_PREFIX = 'authentication|>'
  client.keyValueStore.save(`${AUTHENTICATION_ID_PREFIX}${sid}`, sub)

  res.sendStatus(200)
}

module.exports = {
  connectionInitHandler,
  connectionEventHandler
}
