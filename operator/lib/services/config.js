const dotenv = require('dotenv')
const { JWK } = require('@panva/jose')

dotenv.config()

const {
  HOST,
  PUBLIC_KEY,
  PRIVATE_KEY
} = process.env

const keyConfig = {
  kid: `${HOST}/jwks/operator_key`,
  use: 'sig'
}

module.exports = {
  host: HOST,
  keys: {
    publicKey: JWK.importKey(PUBLIC_KEY, keyConfig),
    privateKey: JWK.importKey(PRIVATE_KEY, keyConfig)
  }
}
