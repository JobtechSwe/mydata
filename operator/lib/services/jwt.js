const { JWT, JWK } = require('@panva/jose')
const { token } = require('@mydata/messaging')
const { keys, host } = require('./config')
const { sign, verify } = token({
  sign: (data, key, header) => JWT.sign(data, key, { header }),
  decode: (tok, opts) => {
    const { payload, header, signature } = JWT.decode(tok, opts)
    return { claimsSet: payload, header, signature }
  },
  verify: JWT.verify,
  importKey: JWK.importKey
})

async function loginEventToken (audience, payload) {
  return sign({
    type: 'LOGIN_EVENT',
    payload
  }, keys.privateKey, {
    issuer: host,
    audience
  })
}

async function connectionEventToken (audience, payload) {
  return sign({
    type: 'CONNECTION_EVENT',
    payload,
    iss: host,
    aud: audience
  }, keys.privateKey, {
    kid: keys.publicKey.kid
  })
}

module.exports = {
  sign,
  verify,
  loginEventToken,
  connectionEventToken,

  keys
}
