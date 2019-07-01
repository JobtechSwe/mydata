const { JWT, JWK, JWS, JWE } = require('@panva/jose')
const { schemas } = require('@egendata/messaging')
const axios = require('axios')
const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')
const { v4 } = require('uuid')

jest.mock('axios', () => ({
  post: jest.fn().mockName('axios.post').mockResolvedValue()
}))

async function generateJWK (domain, use) {
  const key = await JWK.generate('RSA', 1024, { use }, true)
  return JWK.importKey({
    ...key.toJWK(true),
    kid: `${domain}jwks/${key.kid}`
  })
}

describe('tokens', () => {
  let clientKeys, accountEncryptionKey, serviceSigningKey, serviceEncryptionKey, config, client
  beforeAll(async () => {
    clientKeys = await generateKeyPair()
    accountEncryptionKey = await generateJWK('egendata://', 'enc')
    serviceSigningKey = await generateJWK('https://mycv.work', 'sig')
    serviceEncryptionKey = await generateJWK('https://mycv.work', 'enc')
    config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is longer than 10 chars',
      clientId: 'https://mycv.work',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      iconURI: 'https://mycv.work/favicon.png',
      clientKeys: clientKeys,
      keyValueStore: createMemoryStore(),
      keyOptions: { modulusLength: 1024 }
    }
    client = createClient(config)
  })
  describe('#createServiceRegistration', () => {
    it('creates a valid jwt', async () => {
      const authReq = await client.tokens.createServiceRegistration()

      const payload = JWT.decode(authReq)
      expect(payload).not.toBe(null)

      await expect(schemas[payload.type].validate(payload))
        .resolves.not.toThrow()
    })
    it('creates header with correct kid', async () => {
      const authReq = await client.tokens.createServiceRegistration()

      const { header } = JWT.decode(authReq, { complete: true })

      expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
    })
    it('creates header with correct type', async () => {
      const authReq = await client.tokens.createServiceRegistration()

      const { type } = JWT.decode(authReq)

      expect(type).toEqual('SERVICE_REGISTRATION')
    })
    it('creates the correct jwt claimsSet', async () => {
      const authReq = await client.tokens.createServiceRegistration()

      const payload = JWT.decode(authReq)

      expect(payload.aud).toBe('https://smoothoperator.work')
      expect(payload.iss).toBe('https://mycv.work')
      expect(payload.displayName).toBe('CV app')
      expect(payload.description).toBe('A CV app with a description which is longer than 10 chars')
      expect(payload.eventsURI).toBe('https://mycv.work/events')
      expect(payload.jwksURI).toBe('https://mycv.work/jwks')
    })
  })
  describe('#createAuthenticationRequest', () => {
    it('creates a valid jwt', async () => {
      const id = 'some_id'
      const authReq = await client.tokens.createAuthenticationRequest(id)

      const payload = JWT.decode(authReq)
      expect(payload).not.toBe(null)

      await expect(schemas[payload.type].validate(payload))
        .resolves.not.toThrow()
    })
    it('creates header with correct kid', async () => {
      const id = 'some_id'
      const authReq = await client.tokens.createAuthenticationRequest(id)

      const { header } = JWT.decode(authReq, { complete: true })

      expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
    })
    it('creates header with correct type', async () => {
      const id = 'some_id'
      const authReq = await client.tokens.createAuthenticationRequest(id)

      const { type } = JWT.decode(authReq)

      expect(type).toEqual('AUTHENTICATION_REQUEST')
    })
    it('creates the correct jwt claimsSet', async () => {
      const id = v4()
      const authReq = await client.tokens.createAuthenticationRequest(id)

      const payload = JWT.decode(authReq)

      expect(payload.aud).toBe('mydata://account')
      expect(payload.iss).toBe('https://mycv.work')
    })
  })
  describe('#createConnectionRequest', () => {
    describe('with permissions', () => {
      let permissions
      beforeEach(() => {
        permissions = [{
          id: '7f35bc63-1b3a-4712-9bc0-c86212980dec',
          domain: config.clientId,
          area: 'education',
          type: 'WRITE',
          description: 'stuff',
          lawfulBasis: 'CONSENT'
        }]
      })
      it('creates a valid jwt', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, permissions)

        const payload = JWT.decode(authReq)
        expect(payload).not.toBe(null)

        await expect(schemas[payload.type].validate(payload))
          .resolves.not.toThrow()
      })
      it('creates header with correct kid', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, permissions)

        const { header } = JWT.decode(authReq, { complete: true })

        expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
      })
      it('creates header with correct type', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, permissions)

        const { type } = JWT.decode(authReq)

        expect(type).toEqual('CONNECTION_REQUEST')
      })
      it('creates the correct jwt claimsSet', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, permissions)

        const payload = JWT.decode(authReq)

        expect(payload.aud).toBe('mydata://account')
        expect(payload.iss).toBe('https://mycv.work')
        expect(payload.sid).toBe('02cf1e9b-1322-4391-838f-22beeba3d1eb')
        expect(payload.displayName).toBe(config.displayName)
        expect(payload.description).toBe(config.description)
        expect(payload.iconURI).toBe(config.iconURI)
      })
    })
    describe('without permissions', () => {
      it('creates a valid jwt', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, undefined)

        const payload = JWT.decode(authReq)
        expect(payload).not.toBe(null)

        await expect(schemas[payload.type].validate(payload))
          .resolves.not.toThrow()
      })
      it('creates header with correct kid', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, undefined)

        const { header } = JWT.decode(authReq, { complete: true })

        expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
      })
      it('creates header with correct type', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, undefined)

        const { type } = JWT.decode(authReq)

        expect(type).toEqual('CONNECTION_REQUEST')
      })
      it('creates the correct jwt claimsSet', async () => {
        const sid = '02cf1e9b-1322-4391-838f-22beeba3d1eb'
        const authReq = await client.tokens.createConnectionRequest(sid, undefined)

        const payload = JWT.decode(authReq)

        expect(payload.aud).toBe('mydata://account')
        expect(payload.iss).toBe('https://mycv.work')
        expect(payload.sid).toBe('02cf1e9b-1322-4391-838f-22beeba3d1eb')
        expect(payload.displayName).toBe(config.displayName)
        expect(payload.description).toBe(config.description)
        expect(payload.iconURI).toBe(config.iconURI)
      })
    })
  })
  describe('#createWriteDataToken', () => {
    let connectionId, domain, area, data, jwe
    beforeEach(async () => {
      connectionId = 'ef1970af-8f75-4b89-bcee-b30908d02e07'
      domain = 'https://mycv.work'
      area = 'edumacation'
      data = ['Jag älskar hästar']
      const signedData = await JWS.sign(JSON.stringify(data), serviceSigningKey, { kid: serviceSigningKey.kid })
      const encrypt = new JWE.Encrypt(signedData)
      encrypt.recipient(accountEncryptionKey, { kid: accountEncryptionKey.kid })
      encrypt.recipient(serviceEncryptionKey, { kid: serviceEncryptionKey.kid })
      jwe = encrypt.encrypt('general')
    })
    it('creates a valid jwt', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, domain, area, jwe)

      const payload = JWT.decode(authReq)
      expect(payload).not.toBe(null)

      await expect(schemas[payload.type].validate(payload))
        .resolves.not.toThrow()
    })
    it('creates header with correct kid', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, domain, area, jwe)

      const { header } = JWT.decode(authReq, { complete: true })

      expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
    })
    it('creates header with correct type', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, domain, area, jwe)

      const { type } = JWT.decode(authReq)

      expect(type).toEqual('DATA_WRITE')
    })
    it('creates the correct jwt claimsSet', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, domain, area, jwe)

      const payload = JWT.decode(authReq)

      expect(payload.aud).toBe('https://smoothoperator.work')
      expect(payload.iss).toBe('https://mycv.work')
    })
  })
  describe('#send', () => {
    beforeEach(() => {
      axios.post.mockRestore()
      axios.post.mockResolvedValue({})
    })
    it('calls the correct url', async () => {
      await client.tokens.send('https://smoothoperator.com/api', 'some.token')
      expect(axios.post).toHaveBeenCalledWith(
        'https://smoothoperator.com/api',
        'some.token',
        { headers: { 'content-type': 'application/jwt' } }
      )
    })
  })
})
