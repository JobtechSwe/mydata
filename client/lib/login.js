const { verify } = require('./jwt')

const loginEventHandler = client => async ({ payload }, res) => {
  const { payload: { sub, sid } } = await verify(payload.payload)

  const AUTHENTICATION_ID_PREFIX = 'authentication|>'
  client.keyValueStore.save(`${AUTHENTICATION_ID_PREFIX}${sid}`, sub)

  res.sendStatus(200)
}

module.exports = {
  loginEventHandler
}
