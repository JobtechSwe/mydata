const { sign } = require('./jwt')
const { JWK } = require('@panva/jose')

const createServiceRegistration = async (client) => {
  const jwtStuff = {
    aud: client.config.operator,
    iss: client.config.clientId
  }

  const kid = `${client.config.jwksUrl}/client_key`

  const privateKey = JWK.importKey(client.config.clientKeys.privateKey, {
    kid
  })

  const claimsSet = {
    type: 'SERVICE_REGISTRATION',
    displayName: client.config.displayName,
    description: client.config.description,
    eventsURI: client.config.eventsUrl,
    jwksURI: client.config.jwksUrl,
    iconURI: `${client.config.clientId}`,
    ...jwtStuff
  }

  return sign(claimsSet, privateKey, { kid })
}

module.exports = {
  createServiceRegistration
}
