const { JWT, JWS, JWE, JWK } = require('@panva/jose')
const { schemas } = require('@egendata/messaging')
const axios = require('axios')
const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKey } = require('../lib/crypto')
const { v4 } = require('uuid')

jest.mock('axios', () => ({
  post: jest.fn().mockName('axios.post').mockResolvedValue()
}))

describe('tokens', () => {
  let clientKey, accountEncryptionKey, serviceSigningKey, serviceEncryptionKey, config, client
  beforeAll(async () => {
    clientKey = await generateKey('https://mycv.work/jwks', { use: 'sig', kid: 'https://mycv.work/jwks/client_key' })
    accountEncryptionKey = await generateKey('egendata://jwks', { use: 'enc' })
    serviceSigningKey = await generateKey('https://mycv.work/jwks', { use: 'sig' })
    serviceEncryptionKey = await generateKey('https://mycv.work/jwks', { use: 'enc' })
    config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is longer than 10 chars',
      clientId: 'https://mycv.work',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      iconURI: 'https://mycv.work/favicon.png',
      clientKey: clientKey,
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
      const signedData = await JWS.sign(JSON.stringify(data), JWK.importKey(serviceSigningKey), { kid: serviceSigningKey.kid })
      const encrypt = new JWE.Encrypt(signedData)
      encrypt.recipient(JWK.importKey(accountEncryptionKey), { kid: accountEncryptionKey.kid })
      encrypt.recipient(JWK.importKey(serviceEncryptionKey), { kid: serviceEncryptionKey.kid })
      jwe = encrypt.encrypt('general')
    })
    it('creates a valid jwt', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, [ { domain, area, data: jwe } ])

      const payload = JWT.decode(authReq)
      expect(payload).not.toBe(null)

      await expect(schemas[payload.type].validate(payload))
        .resolves.not.toThrow()
    })
    it('creates header with correct kid', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, [ { domain, area, data: jwe } ])

      const { header } = JWT.decode(authReq, { complete: true })

      expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
    })
    it('creates header with correct type', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, [ { domain, area, data: jwe } ])

      const { type } = JWT.decode(authReq)

      expect(type).toEqual('DATA_WRITE')
    })
    it('creates the correct jwt claimsSet', async () => {
      const authReq = await client.tokens
        .createWriteDataToken(connectionId, [ { domain, area, data: jwe } ])

      const payload = JWT.decode(authReq)

      expect(payload.aud).toBe('https://smoothoperator.work')
      expect(payload.iss).toBe('https://mycv.work')
      expect(payload.paths).toEqual([
        { domain, area, data: expect.any(Object) }
      ])
    })
  })
  describe('#createReadDataToken', () => {
    let connectionId, domain, area
    beforeEach(async () => {
      connectionId = 'ef1970af-8f75-4b89-bcee-b30908d02e07'
      domain = 'https://mycv.work'
      area = 'edumacation'
    })
    it('creates a valid jwt', async () => {
      const authReq = await client.tokens
        .createReadDataToken(connectionId, [ { domain, area } ])

      const payload = JWT.decode(authReq)
      expect(payload).not.toBe(null)

      await expect(schemas[payload.type].validate(payload))
        .resolves.not.toThrow()
    })
    it('creates header with correct kid', async () => {
      const authReq = await client.tokens
        .createReadDataToken(connectionId, [ { domain, area } ])

      const { header } = JWT.decode(authReq, { complete: true })

      expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
    })
    it('creates header with correct type', async () => {
      const authReq = await client.tokens
        .createReadDataToken(connectionId, [ { domain, area } ])

      const { type } = JWT.decode(authReq)

      expect(type).toEqual('DATA_READ_REQUEST')
    })
    it('creates the correct jwt claimsSet', async () => {
      const authReq = await client.tokens
        .createReadDataToken(connectionId, [ { domain, area } ])

      const payload = JWT.decode(authReq)

      expect(payload.aud).toBe('https://smoothoperator.work')
      expect(payload.iss).toBe('https://mycv.work')
      expect(payload.paths).toEqual([ { domain, area } ])
    })
  })
  describe('#createAccessToken', () => {
    let sub
    beforeEach(() => {
      sub = '50845c51-cf97-4c55-9198-dcb3f61f2bf8'
    })
    it('creates a valid jwt', async () => {
      const accessToken = await client.tokens.createAccessToken(sub)

      const payload = JWT.decode(accessToken)
      expect(payload).not.toBe(null)

      await expect(schemas[payload.type].validate(payload))
        .resolves.not.toThrow()
    })
    it('creates header with correct kid', async () => {
      const accessToken = await client.tokens.createAccessToken(sub)

      const { header } = JWT.decode(accessToken, { complete: true })

      expect(header.kid).toEqual('https://mycv.work/jwks/client_key')
    })
    it('creates header with correct type', async () => {
      const accessToken = await client.tokens.createAccessToken(sub)

      const { type } = JWT.decode(accessToken)

      expect(type).toEqual('ACCESS_TOKEN')
    })
    it('creates the correct jwt claimsSet', async () => {
      const accessToken = await client.tokens.createAccessToken(sub)

      const payload = JWT.decode(accessToken)

      expect(payload.aud).toBe('https://mycv.work')
      expect(payload.iss).toBe('https://mycv.work')
      expect(payload.sub).toBe(sub)
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
