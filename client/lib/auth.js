const { alg } = require('./messaging')
const { JWT, JWK } = require('@panva/jose')

const createAuthenticationRequest = async (client, id) => {
  const payload = {
    type: 'AUTHENTICATION_REQUEST',
    name: client.config.displayName,
    description: client.config.description,
    events: client.config.eventsUrl
  }

  const privateKey = JWK.importKey(client.config.clientKeys.privateKey, {
    kid: `${client.config.jwksUrl}/client_key`
  })

  return JWT.sign({
    ...payload,
    iss: client.config.clientId,
    aud: 'mydata://auth',
    jti: id
  }, privateKey, {
    algorithm: alg,
    kid: true,
    expiresIn: '5 m'
  })
}

const createAuthenticationUrl = jwt => {
  const base64urlPayload = encodeURIComponent(Buffer.from(jwt)
    .toString('base64')
  )

  return `mydata://auth/${base64urlPayload}`
}

module.exports = {
  createAuthenticationRequest,
  createAuthenticationUrl
}
