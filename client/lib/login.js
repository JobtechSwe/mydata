const { verify } = require('./jwt')

const loginEventHandler = (client) => async ({ payload }, res) => {
  const { payload: { sub, sid } } = await verify(payload.payload)

  const accessToken = await client.tokens.createAccessToken(sub)
  const AUTHENTICATION_ID_PREFIX = 'authentication|>'
  client.keyValueStore.save(`${AUTHENTICATION_ID_PREFIX}${sid}`, accessToken)

  res.sendStatus(200)
}

module.exports = {
  loginEventHandler
}
