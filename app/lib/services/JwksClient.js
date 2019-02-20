import axios from 'axios'
import { certToPEM, rsaPublicKeyToPEM } from './rsaUtils'

export default class JwksClient {
  constructor (options) {
    this.options = { strictSsl: true, ...options }
  }

  async getKeys () {
    const result = await axios.get(this.options.jwksUri)
    return result.data.keys
  }

  async getSigningKeys () {
    const keys = await this.getKeys()

    if (!keys || !keys.length) {
      throw new Error('The JWKS endpoint did not contain any keys')
    }

    const signingKeys = keys
      .filter(key => key.use === 'sig' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e)))
      .map(key => {
        if (key.x5c && key.x5c.length) {
          return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) }
        } else {
          return { kid: key.kid, nbf: key.nbf, rsaPublicKey: rsaPublicKeyToPEM(key.n, key.e) }
        }
      })

    if (!signingKeys.length) {
      throw new Error('The JWKS endpoint did not contain any signing keys')
    }
    return signingKeys
  }

  async getEncryptionKeys () {
    const keys = await this.getKeys()

    if (!keys || !keys.length) {
      throw new Error('The JWKS endpoint did not contain any keys')
    }

    const signingKeys = keys
      .filter(key => key.use === 'enc' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e)))
      .map(key => {
        if (key.x5c && key.x5c.length) {
          return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) }
        } else {
          return { kid: key.kid, nbf: key.nbf, rsaPublicKey: rsaPublicKeyToPEM(key.n, key.e) }
        }
      })

    if (!signingKeys.length) {
      throw new Error('The JWKS endpoint did not contain any encryption keys')
    }
    return signingKeys
  }

  async getSigningKey (kid) {
    const keys = await this.getSigningKeys()
    const key = keys.find(k => k.kid === kid)
    if (key) {
      return key
    } else {
      throw new Error(`Unable to find a signing key that matches '${kid}'`)
    }
  }

  async getEncryptionKey (kid) {
    const keys = await this.getEncryptionKeys()
    const key = keys.find(k => k.kid === kid)
    if (key) {
      return key
    } else {
      throw new Error(`Unable to find an encryption key that matches '${kid}'`)
    }
  }
}
