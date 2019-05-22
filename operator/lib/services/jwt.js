const { JWT, JWK } = require('@panva/jose')
const { token } = require('@mydata/messaging')
const { keys, host } = require('./config')
const { sign, verify } = token({
  sign: (data, key, header) => JWT.sign(data, key, { header }),
  decode: JWT.decode,
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
    payload
  }, keys.privateKey, {
    issuer: host,
    audience
  })
}

module.exports = {
  sign,
  verify,
  loginEventToken,
  connectionEventToken,

  keys
}
