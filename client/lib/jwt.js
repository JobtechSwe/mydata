const { token } = require('@egendata/messaging')
const { JWT, JWK } = require('@panva/jose')

const { sign, verify } = token({
  sign: (payload, key, header) => JWT.sign(payload, JWK.importKey(key), { header }),
  decode: (tok, opts) => {
    const { payload, header, signature } = JWT.decode(tok, opts)
    return { claimsSet: payload, header, signature }
  },
  verify: (tok, jwk) => JWT.verify(tok, JWK.importKey(jwk))
})

module.exports = {
  verify,
  sign
}
