import axios from 'axios'
import { certToPEM, rsaPublicKeyToPEM } from './rsaUtils'

export async function getKey (kid) {
  const { data } = await axios.get(kid)

  if (!data) {
    throw new Error(`Unable to find an encryption key that matches '${kid}'`)
  }

  return (data.x5c && data.x5c.length)
    ? { kid: data.kid, nbf: data.nbf, publicKey: certToPEM(data.x5c[0]) }
    : { kid: data.kid, nbf: data.nbf, publicKey: rsaPublicKeyToPEM(data.n, data.e) }
}
