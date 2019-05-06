const validate = require('../lib/validate')
const { JWT, JWK } = require('@panva/jose')
const { Base64: { encodeURI } } = require('js-base64')
const axios = require('axios')

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

describe('validate', () => {
  let key, wrongKey, kid, payload, jwtLib
  beforeEach(async () => {
    jwtLib = {
      decode: JWT.decode,
      verify: JWT.verify,
      parseKey: JWK.importKey
    }

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
  it('fails if no jwt library is passed in', async () => {
    await expect(validate({}, 'sdkjf')).rejects.toThrow('First argument must be a JWT library')
  })
  it('fails if incorrect format', async () => {
    await expect(validate(jwtLib, 'sdkjf')).rejects.toThrow()
  })
  it('fails if signature is missing', async () => {
    const token = unsigned(payload)
    await expect(validate(jwtLib, token)).rejects.toThrow('Signature missing')
  })
  it('fails if no type', async () => {
    payload.type = undefined
    const token = await signed(payload, key)
    await expect(validate(jwtLib, token)).rejects.toThrow('Type missing')
  })
  it('fails if unknown type', async () => {
    payload.type = 'foo'
    const token = await signed(payload, key)
    await expect(validate(jwtLib, token)).rejects.toThrow('Unknown type')
  })
  it('fails if schema validation for header fails', async () => {
    const token = await signed(payload, key, { algorithm: 'PS256' })
    await expect(validate(jwtLib, token)).rejects.toThrow()
  })
  it('fails if schema validation for payload fails', async () => {
    payload.jti = undefined
    const token = await signed(payload, key)
    await expect(validate(jwtLib, token)).rejects.toThrow()
  })
  it('fails if kid cannot be loaded', async () => {
    axios.get.mockRejectedValue(404)
    const token = await signed(payload, key)
    await expect(validate(jwtLib, token)).rejects.toThrow(`No key found for kid: ${kid}`)
  })
  it('fails if signature is invalid', async () => {
    const [h, p] = await signed(payload, key)
    const token = [h, p, 'asdasasdasd'].join('.')
    await expect(validate(jwtLib, token)).rejects.toThrow()
  })
  it('fails if signature is wrong', async () => {
    const token = await signed(payload, wrongKey)
    await expect(validate(jwtLib, token)).rejects.toThrow()
  })
  describe('token with kid', () => {
    it('fails if kid is missing', async () => {
      const token = await signed(payload, key, { kid: false })
      await expect(validate(jwtLib, token)).rejects.toThrow('No signing key (kid)')
    })
    it('can validate token', async () => {
      const token = await signed(payload, key)
      const result = await validate(jwtLib, token)
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
      await expect(validate(jwtLib, token)).rejects.toThrow('No signing key (jwk)')
    })
    it('can validate token', async () => {
      const token = await signed(payload, deviceKey, {
        kid: false,
        issuer: 'mydata://account',
        audience: 'https://mycv.work',
        header: { jwk: deviceKey }
      })
      const result = await validate(jwtLib, token)
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
