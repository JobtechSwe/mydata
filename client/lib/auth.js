const { JWT, JWK } = require('@panva/jose')
const { token } = require('@mydata/messaging')

const createAuthenticationRequest = async (client, id) => {
  const { sign } = token({ ...JWT, importKey: JWK.importKey })

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
    audience: 'mydata://auth',
    issuer: client.config.clientId
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
