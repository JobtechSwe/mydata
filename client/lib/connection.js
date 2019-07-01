const { verify } = require('./jwt')
const { createPermissions } = require('./permissions')

const AUTHENTICATION_PREFIX = 'authentication|>'
const CONNECTION_PREFIX = 'connection|>'

const connectionInitHandler = (client) => async ({ payload: { sid } }, res, next) => {
  try {
    let permissions
    if (client.config.defaultPermissions) {
      permissions = await createPermissions(
        client.config.defaultPermissions,
        client.config.clientId,
        client.keyProvider
      )
    }
    const connectionRequest = await client.tokens
      .createConnectionRequest(sid, permissions)

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
      for (let permission of permissions.approved.filter((p) => p.type === 'READ')) {
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
