const { JWK } = require('@panva/jose')
const { sign } = require('./jwx')

const createAuthenticationRequest = async (client, id) => {
  const payload = {
    type: 'AUTHENTICATION_REQUEST',
    sid: id
  }

  const privateKey = JWK.importKey(client.config.clientKeys.privateKey, {
    kid: `${client.config.jwksUrl}/client_key`
  })

  return sign({
    ...payload
  }, privateKey, {
    audience: 'mydata://account',
    issuer: client.config.clientId
  })
}

const createAuthenticationUrl = jwt => `mydata://account/${jwt}`

module.exports = {
  createAuthenticationRequest,
  createAuthenticationUrl
}
