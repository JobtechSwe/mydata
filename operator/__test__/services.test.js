const services = require('../lib/services')
const jwt = require('../lib/services/jwt')
const { query, multiple } = require('../lib/adapters/postgres')
const axios = require('axios')

jest.mock('../lib/adapters/postgres', () => ({
  query: jest.fn().mockResolvedValue(),
  multiple: jest.fn().mockResolvedValue([])
}))
jest.mock('../lib/services/jwt', () => ({
  loginEventToken: jest.fn().mockResolvedValue('login.event.token'),
  connectionEventToken: jest.fn().mockResolvedValue('connection.event.token')
}))

describe('services', () => {
  let header, payload, token, res

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
      expect(query).toHaveBeenCalledWith(expect.any(String), [
        'https://mycv.work',
        JSON.stringify(header.jwk),
        'My CV',
        'For CV:s',
        'https://mycv.work/icon.png',
        'https://mycv.work/events',
        'https://mycv.work/jwks'
      ])
    })
  })
  describe('#accountConnect', () => {
    let accountResponse, serviceResponse, connectionResponse
    beforeEach(() => {
      header = {}
      payload = {
        type: 'CONNECT',
        iss: 'mydata://account/abcdef',
        aud: ['https://smoothoperator.work', 'https://mycv.work'],
        sub: 'd5502d22-cc18-4c3d-be38-d76ede4e78da',
        jti: 'abcdef',
        permissions: {}
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
      expect(multiple).toHaveBeenCalledWith([
        [expect.any(String), ['mydata://account/abcdef']],
        [expect.any(String), ['https://mycv.work']],
        [expect.any(String), ['mydata://account/abcdef', 'https://mycv.work']]
      ])
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
  })
  describe('#accountLogin', () => {
    let accountResponse, serviceResponse, connectionResponse
    beforeEach(() => {
      header = {}
      payload = {
        type: 'LOGIN',
        iss: 'mydata://account/abcdef',
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
      expect(multiple).toHaveBeenCalledWith([
        [expect.any(String), ['mydata://account/abcdef']],
        [expect.any(String), ['https://mycv.work']],
        [expect.any(String), ['mydata://account/abcdef', 'https://mycv.work']]
      ])
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
