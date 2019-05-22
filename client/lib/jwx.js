const { JWT, JWK } = require('@panva/jose')
const { token } = require('@mydata/messaging')

const {
  sign, verify
} = token({ ...JWT, importKey: JWK.importKey })

module.exports = { sign, verify }
