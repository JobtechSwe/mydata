const { JWT, JWK } = require('@panva/jose')
const { alg } = require('./messaging')

const createClientRegistration = async (client) => {
  const claimsSet = {
    type: 'CLIENT_REGISTRATION',
    displayName: client.config.displayName,
    description: client.config.description,
    eventsUrl: client.config.eventsUrl,
    jwksUrl: client.config.jwksUrl
  }

  const privateKey = JWK.importKey(client.config.clientKeys.privateKey, {
    kid: `${client.config.jwksUrl}/client_key`
  })

  return JWT.sign({
    ...claimsSet,
    iss: client.config.clientId,
    aud: client.config.operator
  }, privateKey, {
    algorithm: alg,
    kid: true,
    expiresIn: '60 s',
    iat: false
  })
}

module.exports = {
  createClientRegistration
}
