const services = require('../lib/services')
const jwt = require('../lib/services/jwt')
const sqlStatements = require('../lib/sqlStatements')
const { multiple, transaction } = require('../lib/adapters/postgres')
const axios = require('axios')
const { JWK } = require('@panva/jose')

jest.mock('../lib/adapters/postgres', () => ({
  query: jest.fn().mockResolvedValue(),
  multiple: jest.fn().mockResolvedValue([]),
  transaction: jest.fn().mockResolvedValue([])
}))
jest.mock('../lib/services/jwt', () => ({
  loginEventToken: jest.fn().mockResolvedValue('login.event.token'),
  connectionEventToken: jest.fn().mockResolvedValue('connection.event.token')
}))
jest.mock('../lib/sqlStatements', () => ({
  accountKeyInsert: jest.fn().mockName('accountKeyInsert').mockReturnValue([]),
  checkConnection: jest.fn().mockName('checkConnection').mockReturnValue([]),
  connectionInsert: jest.fn().mockName('connectionInsert').mockReturnValue([]),
  permissionInsert: jest.fn().mockName('permissionInsert').mockReturnValue([]),
  serviceInsert: jest.fn().mockName('serviceInsert').mockReturnValue([])
}))

describe('services', () => {
  let header, payload, token, res

  function jwk ({ domain = 'mydata://account/', use = 'sig' } = {}) {
    const key = JWK.generateSync('RSA', 1024, { use })
    const kid = `${domain}${key.thumbprint}`
    return JWK.importKey(key.toJWK(), { kid }).toJWK()
  }

  beforeEach(() => {
    res = {
      sendStatus: jest.fn()
    }
  })

  describe('#registerService', () => {
    it('calls postgres with the correct parameters', async () => {
      token = 'register.token'
      header = {
        jwk: {
          kid: 'https://mycv.work/jwks/service_key',
          kty: 'rsa',
          use: 'sig',
          e: 'AQAB',
          n: 'So much base64'
        }
      }
      payload = {
        type: 'SERVICE_REGISTRATION',
        aud: 'https://smoothoperator.work',
        iss: 'https://mycv.work',
        displayName: 'My CV',
        description: 'For CV:s',
        iconURI: 'https://mycv.work/icon.png',
        jwksURI: 'https://mycv.work/events',
        eventsURI: 'https://mycv.work/jwks'
      }
      await services.registerService({ header, payload, token }, res)

      expect(sqlStatements.serviceInsert).toHaveBeenCalledWith({
        serviceId: 'https://mycv.work',
        serviceKey: JSON.stringify(header.jwk),
        displayName: 'My CV',
        description: 'For CV:s',
        iconURI: 'https://mycv.work/icon.png',
        jwksURI: 'https://mycv.work/events',
        eventsURI: 'https://mycv.work/jwks'
      })
    })
  })
  describe('#accountConnect', () => {
    let accountResponse, serviceResponse, connectionResponse
    beforeEach(() => {
      header = {
        jwk: jwk()
      }
      payload = {
        type: 'CONNECT',
        iss: `mydata://account`,
        aud: ['https://smoothoperator.work', 'https://mycv.work'],
        sub: 'd5502d22-cc18-4c3d-be38-d76ede4e78da',
        jti: 'abcdef',
        permissions: {
          local: {
            education: {
              read: {
                id: 'f9564663-120d-4e8a-9977-5d0566aed1fc',
                purpose: 'Stuff',
                lawfulBasis: 'CONSENT',
                jwks: [jwk({ domain: 'https://mycv.work/jwks/', use: 'enc' }), jwk({ use: 'enc' })]
              },
              write: {
                id: 'eedc56be-b128-4cfd-b7ea-06dc6f197c92',
                description: 'Info',
                lawfulBasis: 'CONSENT'
              }
            }
          },
          external: {
            'https://monster.se': {
              experience: {
                read: {
                  id: 'f97b6b6c-3c28-4e2f-bfee-ca987dc2a8ff',
                  purpose: 'Good stuff',
                  jwks: [jwk({ domain: 'https://monster.se/jwks/', use: 'enc' }), jwk({ domain: 'https://mycv.work/jwks/', use: 'enc' }), jwk({ use: 'enc' })],
                  lawfulBasis: 'CONSENT'
                }
              }
            }
          }
        }
      }
      accountResponse = { account_key: 'foo' }
      serviceResponse = { events_uri: 'https://mycv.work/events' }
      connectionResponse = { connection_id: 'ceca7b41-96ab-4439-82e1-7aa487fa2e4d' }
      multiple.mockResolvedValue([
        { rows: [accountResponse] },
        { rows: [serviceResponse] },
        { rows: [] }
      ])
    })
    it('gets account, service and existing connection from db', async () => {
      await services.accountConnect({ header, payload, token })

      expect(sqlStatements.checkConnection).toHaveBeenCalledWith({
        accountId: header.jwk.kid,
        serviceId: payload.aud[1]
      })
    })
    it('throws if account is missing', async () => {
      multiple.mockResolvedValueOnce([
        { rows: [] },
        { rows: [serviceResponse] },
        { rows: [] }
      ])
      await expect(services.accountConnect({ header, payload, token }))
        .rejects.toThrow('No such account')
    })
    it('throws if service is missing', async () => {
      multiple.mockResolvedValueOnce([
        { rows: [accountResponse] },
        { rows: [] },
        { rows: [] }
      ])
      await expect(services.accountConnect({ header, payload, token }))
        .rejects.toThrow('No such service')
    })
    it('throws if connection exists', async () => {
      multiple.mockResolvedValueOnce([
        { rows: [accountResponse] },
        { rows: [serviceResponse] },
        { rows: [connectionResponse] }
      ])
      await expect(services.accountConnect({ header, payload, token }))
        .rejects.toThrow('Connection already exists')
    })
    it('calls jwt.connectionEventToken with correct arguments', async () => {
      await services.accountConnect({ header, payload, token })
      expect(jwt.connectionEventToken).toHaveBeenCalledWith(payload.aud[1], token)
    })
    it('sends a LOGIN_EVENT to service', async () => {
      await services.accountConnect({ header, payload, token })
      expect(axios.post)
        .toHaveBeenCalledWith('https://mycv.work/events', 'connection.event.token', {
          headers: { 'Content-Type': 'application/jwt' }
        })
    })
    it('saves connection to db', async () => {
      payload.permissions = {}
      await services.accountConnect({ header, payload, token })

      expect(sqlStatements.connectionInsert).toHaveBeenCalledWith({
        connectionId: payload.sub,
        accountId: header.jwk.kid,
        serviceId: payload.aud[1]
      })
    })
    it.skip('saves permissions to db', async () => {
      await services.accountConnect({ header, payload, token })

      expect(sqlStatements.accountKeyInsert)
        .toHaveBeenCalledWith({
          accountKeyId: '',
          accountId: header.jwk.kid,
          domain: payload.aud[1],
          area: 'education',
          readKey: ''
        })
      expect(sqlStatements.permissionInsert)
        .toHaveBeenCalledWith({})
      expect(transaction).toHaveBeenCalledWith([
        expect.any(Array), // Connection
        [expect.stringMatching(/INSERT INTO permissions/), [
          payload.permissions.local.education.read.id,
          payload.sub,
          payload.aud[1],
          'education',
          'READ',
          payload.permissions.local.education.read.purpose,
          payload.permissions.local.education.read.legalBasis,
          JSON.stringify(payload.permissions.local.education.read.jwks[0]),
          'now()'
        ]],
        [expect.stringMatching(/INSERT INTO permissions/), [
          payload.permissions.local.education.read.id,
          payload.sub,
          payload.aud[1],
          'education',
          'WRITE',
          payload.permissions.local.education.read.purpose,
          payload.permissions.local.education.read.legalBasis,
          null,
          'now()'
        ]],
        [expect.stringMatching(/INSERT INTO account_keys/), [
          payload.permissions.local.education.read.jwks[1].kid,
          header.jwk.kid,
          payload.aud[1],
          'education',
          JSON.stringify(payload.permissions.local.education.read.jwks[1]),
          'now()'
        ]]
      ])
    })
  })
  describe('#accountLogin', () => {
    let accountResponse, serviceResponse, connectionResponse
    beforeEach(() => {
      header = {
        jwk: jwk()
      }
      payload = {
        type: 'LOGIN',
        iss: 'mydata://account/',
        aud: ['https://smoothoperator.work', 'https://mycv.work'],
        jti: 'abcdef'
      }
      accountResponse = { account_key: 'foo' }
      serviceResponse = { events_uri: 'https://mycv.work/events' }
      connectionResponse = { connection_id: 'ceca7b41-96ab-4439-82e1-7aa487fa2e4d' }
      multiple.mockResolvedValue([
        { rows: [accountResponse] },
        { rows: [serviceResponse] },
        { rows: [connectionResponse] }
      ])
    })
    it('gets account, service and existing connection from db', async () => {
      await services.accountLogin({ header, payload, token })
      expect(sqlStatements.checkConnection).toHaveBeenCalledWith({
        accountId: header.jwk.kid,
        serviceId: 'https://mycv.work'
      })
    })
    it('throws if account is missing', async () => {
      multiple.mockResolvedValueOnce([
        { rows: [] },
        { rows: [serviceResponse] },
        { rows: [connectionResponse] }
      ])
      await expect(services.accountLogin({ header, payload, token }))
        .rejects.toThrow('No such account')
    })
    it('throws if service is missing', async () => {
      multiple.mockResolvedValueOnce([
        { rows: [accountResponse] },
        { rows: [] },
        { rows: [connectionResponse] }
      ])
      await expect(services.accountLogin({ header, payload, token }))
        .rejects.toThrow('No such service')
    })
    it('throws if connection is missing', async () => {
      multiple.mockResolvedValueOnce([
        { rows: [accountResponse] },
        { rows: [serviceResponse] },
        { rows: [] }
      ])
      await expect(services.accountLogin({ header, payload, token }))
        .rejects.toThrow('No connection exists')
    })
    it('calls jwt.loginEventToken with correct arguments', async () => {
      await services.accountLogin({ header, payload, token })
      expect(jwt.loginEventToken).toHaveBeenCalledWith(payload.aud[1], token)
    })
    it('sends a LOGIN_EVENT to service', async () => {
      await services.accountLogin({ header, payload, token })
      expect(axios.post)
        .toHaveBeenCalledWith('https://mycv.work/events', 'login.event.token', {
          headers: { 'Content-Type': 'application/jwt' }
        })
    })
  })
})
