const request = require('supertest')
const { generateKeyPair, createSign } = require('crypto')
const { promisify } = require('util')

const createApi = (app) => {
  const api = request(app)
  return {
    get: (url, headers = {}) => api
      .get(url)
      .set({ Accept: 'application/json', ...headers }),
    post: (url, data, headers = {}) => api.post(url)
      .set({ 'Content-Type': 'application/json', ...headers })
      .accept('application/json')
      .send(data),
    put: (url, data, headers = {}) => api.put(url)
      .set({ 'Content-Type': 'application/json', ...headers })
      .accept('application/json')
      .send(data),
    patch: (url, data, headers = {}) => api.patch(url)
      .set({ 'Content-Type': 'application/json', ...headers })
      .accept('application/json')
      .send(data),
    del: (url, headers = {}) => api
      .del(url)
      .set({ Accept: 'application/json', ...headers }),
    delete: (url, headers = {}) => api
      .delete(url)
      .set({ Accept: 'application/json', ...headers })
  }
}

const generateKeys = async (use, kid) => {
  const { publicKey, privateKey } = await promisify(generateKeyPair)('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  })
  return { use, kid, publicKey, privateKey }
}

const sign = (alg, data, privateKey) => {
  return createSign(alg)
    .update(JSON.stringify(data))
    .sign(privateKey, 'base64')
}

const payload = (data, keyPair) => {
  return {
    data,
    signature: {
      alg: 'RSA-SHA512',
      kid: keyPair.kid,
      data: sign('RSA-SHA512', data, keyPair.privateKey)
    }
  }
}

module.exports = { createApi, generateKeys, sign, payload }
