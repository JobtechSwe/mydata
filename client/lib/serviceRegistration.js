const { JWT, JWK } = require('@panva/jose')
const { token } = require('@mydata/messaging')

const { sign } = token({ ...JWT, importKey: JWK.importKey })

const createServiceRegistration = async (client) => {
  const payload = {
    type: 'SERVICE_REGISTRATION',
    displayName: client.config.displayName,
    description: client.config.description,
    eventsURI: client.config.eventsUrl,
    jwksURI: client.config.jwksUrl,
    iconURI: `${client.config.clientId}`
  }

  const privateKey = JWK.importKey(client.config.clientKeys.privateKey, {
    kid: `${client.config.jwksUrl}/client_key`
  })

  return sign(payload, privateKey, { audience: client.config.operator, issuer: client.config.clientId })
}

module.exports = {
  createServiceRegistration
}
