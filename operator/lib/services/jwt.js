const { JWT, JWK } = require('@panva/jose')
const { token } = require('@mydata/messaging')
const { sign, verify } = token({
  sign: JWT.sign,
  decode: JWT.decode,
  verify: JWT.verify,
  importKey: JWK.importKey
})

const operatorKeys = {
  publicKey: JWK.importKey(process.env.publicKey),
  privateKey: JWK.importKey(process.env.privateKey)
}

async function accessToken (audience, subject) {
  return sign({
    type: 'ACCESS_TOKEN'
  }, operatorKeys.privateKey, {
    audience,
    subject,
    issuer: 'https://smoothoperator.org'
  })
}

async function registrationEvent (registrationToken) {
  const { payload } = await verify(registrationToken)
  return sign({
    type: 'REGISTRATION_EVENT',
    accessToken: await accessToken(payload.aud[1], payload.sub),
    payload: registrationToken
  }, operatorKeys.privateKey, {
    issuer: 'https://smoothoperator.org',
    audience: payload.aud[1]
  })
}

// TODO: remove
function createToken (data) {
  const secret = JWK.importKey(process.env.JWT_SECRET || 'sdfkjshkfjsdofdsj')
  return JWT.sign({ data }, secret)
}

module.exports = {
  sign,
  verify,
  accessToken,
  registrationEvent,

  operatorKeys,

  createToken
}
