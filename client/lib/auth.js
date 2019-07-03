const { JWK } = require('@panva/jose')
const { sign } = require('./jwt')

const createAuthenticationRequest = async (client, id) => {
  const payload = {
    type: 'AUTHENTICATION_REQUEST',
    sid: id,
    aud: 'mydata://account',
    iss: client.config.clientId,
    eventsURI: client.config.eventsUrl
  }

  const kid = `${client.config.jwksUrl}/client_key`

  const privateKey = JWK.importKey(client.config.clientKeys.privateKey, {
    kid
  })

  return sign({
    ...payload
  }, privateKey, {
    kid
  })
}

const createAuthenticationUrl = jwt => `mydata://account/${jwt}`

module.exports = {
  createAuthenticationRequest,
  createAuthenticationUrl
}
