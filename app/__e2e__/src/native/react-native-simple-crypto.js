import {
  createSign,
  createVerify,
  createHash,
  generateKeyPair,
  publicEncrypt,
  privateDecrypt,
} from 'crypto'

export const RSA = {
  generateKeys: modulusLength => {
    return new Promise((resolve, reject) => {
      generateKeyPair(
        'rsa',
        {
          modulusLength,
          publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
        },
        (err, publicKey, privateKey) => {
          if (err) {
            reject(err)
          } else {
            resolve({ private: privateKey, public: publicKey })
          }
        }
      )
    })
  },
  sign: (data, privateKey, hash) => {
    return Promise.resolve(
      createSign(hash)
        .update(data)
        .sign(privateKey, 'base64')
    )
  },
  verify: (secretToVerify, data, key, hash) => {
    return Promise.resolve(
      createVerify(hash)
        .update(secretToVerify)
        .verify(key, data, 'base64')
    )
  },
  encrypt: (data, key) => {
    return Promise.resolve(
      publicEncrypt(key, Buffer.from(data)).toString('base64')
    )
  },
  decrypt: (rsaEncryptedMessage, key) => {
    return Promise.resolve(
      privateDecrypt(key, Buffer.from(rsaEncryptedMessage)).toString('utf8')
    )
  },
}

export const SHA = {
  sha256: text => {
    return Promise.resolve(
      createHash('SHA256')
        .update(text)
        .digest('base64')
    )
  },
  sha512: text => {
    return Promise.resolve(
      createHash('SHA512')
        .update(text)
        .digest('base64')
    )
  },
}
