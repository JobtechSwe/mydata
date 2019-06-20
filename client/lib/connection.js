const { sign, verify } = require('./jwt')
const pem2jwk = require('pem-jwk').pem2jwk
const { createPermissions } = require('./permissions')

const AUTHENTICATION_PREFIX = 'authentication|>'
const CONNECTION_PREFIX = 'connection|>'

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

const connectionEventHandler = (client) => async ({ payload }, res, next) => {
  try {
    const { payload: { sub, sid, permissions } } = await verify(payload.payload)

    client.keyValueStore.save(`${AUTHENTICATION_PREFIX}${sid}`, sub)

    const connection = { permissions }
    client.keyValueStore.save(`${CONNECTION_PREFIX}${sub}`, JSON.stringify(connection))

    if (permissions && permissions.approved) {
      for (let permission of permissions.approved.filter(p => p.type === 'READ')) {
        await client.keyProvider.makeKeyPermanent(permission.kid)
      }
    }

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  connectionInitHandler,
  connectionEventHandler
}
