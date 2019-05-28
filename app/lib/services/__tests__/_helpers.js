import { RSA } from 'react-native-rsa-native'
import pem2jwk from 'simple-pem2jwk'

export const generateTestAccount = async () => {
  const keys = await RSA.generateKeys(1024)
  return {
      id: 'foo',
      keys: {
        privateKey: pem2jwk(keys.private),
        publicKey: pem2jwk(keys.public, { use: 'sig' }),
      },
      pds: { provider: 'memory' },
    }
}