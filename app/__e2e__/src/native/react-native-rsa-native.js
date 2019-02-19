import {
  createSign,
  createVerify,
  generateKeyPair,
  privateEncrypt
} from 'crypto'

export const RSA = {
  generateKeys: async (modulusLength) => {
    return new Promise((resolve, reject) => {
      generateKeyPair('rsa', {
        modulusLength,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
      }, (err, publicKey, privateKey) => {
        if (err) {
          reject(err)
        } else {
          resolve({ private: privateKey, public: publicKey })
        }
      })
    })
  },
  sign: async (data, privateKey) => {
    return Promise.resolve(createSign('RSA-SHA512').update(data).sign(privateKey, 'base64'))
  },
  verify: async (data, secretToVerify, key) => {
    return Promise.resolve(createVerify('RSA-SHA512')
      .update(secretToVerify)
      .verify(key, data, 'base64'))
  },
  encrypt: async (data, key) => {
    return Promise.resolve(privateEncrypt(key, Buffer.from(data)).toString('base64'))
  }
}
