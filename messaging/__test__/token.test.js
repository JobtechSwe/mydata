const tokenService = require('../lib/token')
const { JWT, JWK } = require('@panva/jose')
const { Base64: { encodeURI } } = require('js-base64')
const axios = require('axios')

const { verify, sign } = tokenService({
  sign: JWT.sign,
  decode: JWT.decode,
  verify: JWT.verify,
  importKey: JWK.importKey
})

const defaultOptions = {
  typ: 'JWT',
  algorithm: 'RS256',
  expiresIn: '1 hour',
  issuer: 'https://mycv.work',
  audience: 'mydata://auth'
}

async function signed (payload, key, options = {}) {
  options = Object.assign({}, defaultOptions, options)
  return JWT.sign(payload, key, options)
}

function unsigned (payload) {
  const header = { typ: 'JWT', alg: 'none' }
  return `${encodeURI(JSON.stringify(header))}.${encodeURI(JSON.stringify(payload))}.`
}

describe('token', () => {
  describe('#verify', () => {
    let key, wrongKey, kid, payload
    beforeEach(async () => {
      kid = 'https://mycv.work/jwks/abcdef0123456789'
      key = await JWK.generate('RSA', 1024, { kid, use: 'sig' })
      wrongKey = await JWK.generate('RSA', 1024, { kid, use: 'sig' })
      axios.get.mockResolvedValue({ status: 200, data: JSON.parse(JSON.stringify(key)) })
      payload = {
        type: 'AUTHENTICATION_REQUEST',
        jti: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
        name: 'Mitt CV',
        description: 'Ditt CV',
        events: 'https://mycv.work/events'
      }
    })
    it('fails if incorrect format', async () => {
      await expect(verify('sdkjf')).rejects.toThrow()
    })
    it('fails if signature is missing', async () => {
      const token = unsigned(payload)
      await expect(verify(token)).rejects.toThrow('Signature missing')
    })
    it('fails if no type', async () => {
      payload.type = undefined
      const token = await signed(payload, key)
      await expect(verify(token)).rejects.toThrow('Type missing')
    })
    it('fails if unknown type', async () => {
      payload.type = 'foo'
      const token = await signed(payload, key)
      await expect(verify(token)).rejects.toThrow('Unknown type')
    })
    it('fails if schema validation for header fails', async () => {
      const token = await signed(payload, key, { algorithm: 'PS256' })
      await expect(verify(token)).rejects.toThrow()
    })
    it('fails if schema validation for payload fails', async () => {
      payload.jti = undefined
      const token = await signed(payload, key)
      await expect(verify(token)).rejects.toThrow()
    })
    it('fails if kid cannot be loaded', async () => {
      axios.get.mockRejectedValue(404)
      const token = await signed(payload, key)
      await expect(verify(token)).rejects.toThrow(`No key found for kid: ${kid}`)
    })
    it('fails if signature is invalid', async () => {
      const [h, p] = await signed(payload, key)
      const token = [h, p, 'asdasasdasd'].join('.')
      await expect(verify(token)).rejects.toThrow()
    })
    it('fails if signature is wrong', async () => {
      const token = await signed(payload, wrongKey)
      await expect(verify(token)).rejects.toThrow()
    })
    describe('token with kid', () => {
      it('fails if kid is missing', async () => {
        const token = await signed(payload, key, { kid: false })
        await expect(verify(token)).rejects.toThrow('No signing key (kid)')
      })
      it('can verify token', async () => {
        const token = await signed(payload, key)
        const result = await verify(token)
        expect(result.header).toEqual({
          alg: 'RS256',
          kid: 'https://mycv.work/jwks/abcdef0123456789'
        })
        expect(result.payload).toEqual({
          aud: 'mydata://auth',
          description: 'Ditt CV',
          events: 'https://mycv.work/events',
          exp: expect.any(Number),
          iat: expect.any(Number),
          iss: 'https://mycv.work',
          jti: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
          name: 'Mitt CV',
          type: 'AUTHENTICATION_REQUEST'
        })
      })
    })
    describe('token with jwk', () => {
      let deviceKey
      beforeEach(async () => {
        deviceKey = await JWK.generate('RSA', 1024, { kid: 'mydata://account/jwks/account_key', use: 'sig' })
        payload = {
          type: 'REGISTRATION_INIT',
          jti: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
          aud: 'https://mycv.work'
        }
      })
      it('fails if jwk is missing', async () => {
        const token = await signed(payload, deviceKey)
        await expect(verify(token)).rejects.toThrow('No signing key (jwk)')
      })
      it('can verify token', async () => {
        const token = await signed(payload, deviceKey, {
          kid: false,
          issuer: 'mydata://account',
          audience: 'https://mycv.work',
          header: { jwk: deviceKey }
        })
        const result = await verify(token)
        expect(result.header).toEqual({
          alg: 'RS256',
          jwk: JSON.parse(JSON.stringify(deviceKey))
        })
        expect(result.payload).toEqual({
          type: 'REGISTRATION_INIT',
          jti: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
          aud: 'https://mycv.work',
          iss: 'mydata://account',
          exp: expect.any(Number),
          iat: expect.any(Number)
        })
      })
    })
  })
  describe('#sign', () => {
    let payload, options, key
    beforeEach(async () => {
      payload = {
        type: 'REGISTRATION_INIT',
        jti: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
        aud: 'https://mycv.work'
      }
      options = {
        kid: false,
        issuer: 'mydata://account',
        audience: 'https://mycv.work',
        header: { jwk: key },
        algorithm: 'RS256'
      }
      key = await JWK.generate('RSA', 1024, {
        kid: 'mydata://account/jwks/account_key',
        use: 'sig'
      })
    })
    it('throws if type is missing', async () => {
      payload.type = undefined
      await expect(sign(payload)).rejects.toThrow('Payload must have a type')
    })
    it('throws if type is unknown', async () => {
      payload.type = 'foo'
      await expect(sign(payload)).rejects.toThrow('Unknown schema foo')
    })
    it('throws if schema validation fails', async () => {
      options.issuer = undefined
      await expect(sign(payload, key, options)).rejects.toThrow()
    })
    it('returns a token', async () => {
      const token = await signed(payload, key, options)
      expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
    })
  })
})
