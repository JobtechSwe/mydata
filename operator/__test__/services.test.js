const axios = require('axios')
const { jwks } = require('@egendata/messaging')
const services = require('../lib/services')
const postgres = require('../lib/adapters/postgres')
const jwt = require('../lib/services/jwt')
const tokens = require('../lib/services/tokens')
const sqlStatements = require('../lib/sqlStatements')

jest.mock('@egendata/messaging', () => ({
  jwks: {
    getKeys: jest.fn().mockName('messaging/jwks.getKeys')
  }
}))
jest.mock('../lib/adapters/postgres', () => ({
  query: jest.fn().mockResolvedValue(),
  multiple: jest.fn().mockResolvedValue([]),
  transaction: jest.fn().mockResolvedValue([])
}))
jest.mock('../lib/services/jwt', () => ({
  verify: jest.fn().mockName('jwt.verify'),
  loginEventToken: jest.fn().mockName('jwt.loginEventToken').mockResolvedValue('login.event.token'),
  connectionEventToken: jest.fn().mockName('jwt.connectionEventToken').mockResolvedValue('connection.event.token')
}))
jest.mock('../lib/services/tokens', () => ({
  createConnectionEvent: jest.fn().mockName('tokens.createConnectionEvent')
    .mockResolvedValue('connection.event.token'),
  createLoginEvent: jest.fn().mockName('tokens.createLoginEvent')
    .mockResolvedValue('login.event.token')
}))
jest.mock('../lib/sqlStatements', () => ({
  accountKeyInsert: jest.fn().mockName('sqlStatements.accountKeyInsert').mockReturnValue([]),
  checkConnection: jest.fn().mockName('sqlStatements.checkConnection').mockReturnValue([]),
  connectionInserts: jest.fn().mockName('sqlStatements.connectionInserts').mockReturnValue([[]]),
  permissionsInserts: jest.fn().mockName('permissionsInserts').mockReturnValue([[]]),
  serviceInsert: jest.fn().mockName('serviceInsert').mockReturnValue([])
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
  describe('#loginResponse', () => {
    let loginResponse, login
    let dbAccounts, dbServices, dbConnections
    let res, next
    beforeEach(() => {
      loginResponse = {
        iss: 'egendata://account/abcd',
        payload: 'login.token'
      }
      login = {
        aud: 'https://mycv.work',
        sub: 'f3dd37fb-4e78-4dab-88b7-532e0377f7d7'
      }
      jwt.verify.mockName('jwt.verify').mockResolvedValue({ payload: login })

      dbAccounts = [{}]
      dbServices = [{}]
      dbConnections = [{}]
      postgres.multiple.mockImplementation(async () => [
        { rows: dbAccounts },
        { rows: dbServices },
        { rows: dbConnections }
      ])

      res = {
        sendStatus: jest.fn().mockName('res.sendStatus')
      }
      next = jest.fn().mockName('next')
    })
    it('verifies payload', async () => {
      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(jwt.verify).toHaveBeenCalledWith('login.token')
    })
    it('checks db for existing account, service and connection', async () => {
      sqlStatements.checkConnection.mockReturnValue(['connection sql'])

      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(sqlStatements.checkConnection).toHaveBeenCalledWith({
        accountId: 'egendata://account/abcd',
        serviceId: 'https://mycv.work'
      })
      expect(postgres.multiple).toHaveBeenCalledWith(['connection sql'])
    })
    it('throws if no account exists', async () => {
      dbAccounts = []
      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(next).toHaveBeenCalledWith(
        new Error(`No such account ${loginResponse.iss}`)
      )
    })
    it('throws if no service exists', async () => {
      dbServices = []
      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(next).toHaveBeenCalledWith(
        new Error(`No such service ${login.aud}`)
      )
    })
    it('throws if connection already exists', async () => {
      dbConnections = []
      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(next).toHaveBeenCalledWith(
        new Error('No connection exists')
      )
    })
    it('creates a LOGIN_EVENT', async () => {
      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(tokens.createLoginEvent).toHaveBeenCalledWith(
        'https://mycv.work',
        'login.token'
      )
    })
    it('sends CONNECTION_EVENT to service', async () => {
      dbServices = [{ events_uri: 'https://mycv.work/events' }]
      tokens.createConnectionEvent.mockResolvedValue('connection.event.token')

      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(axios.post).toHaveBeenCalledWith(
        'https://mycv.work/events',
        'login.event.token',
        { headers: { 'content-type': 'application/jwt' } }
      )
    })
    it('responds with 200 OK if all goes well', async () => {
      await services.loginResponse({ payload: loginResponse }, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(200)
    })
  })
  describe('#connectionResponse', () => {
    let connectionResponse, connection
    let accountKey, myCvEducationKey
    let dbAccounts, dbServices, dbConnections
    let res, next
    beforeEach(() => {
      accountKey = {
        kid: 'egendata://jwks/abcd'
      }
      myCvEducationKey = {
        kid: 'https://mycv.work/jwks/abcd'
      }
      connectionResponse = {
        iss: 'egendata://account/9b517596-6348-4025-9324-9beefe2e4ac6',
        payload: 'connectionToken'
      }
      connection = {
        aud: 'https://mycv.work',
        sub: '8953eb68-6eb0-4577-8b7d-a2599de962d4',
        permissions: {
          approved: [
            {
              id: '1fc622ab-ebdf-4f8d-a0dd-1afbfb492a5a',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'READ',
              purpose: 'stuff',
              lawfulBasis: 'CONSENT',
              kid: myCvEducationKey.kid
            },
            {
              id: '052bb693-de11-442c-a5b1-3fa9a36bc851',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'WRITE',
              description: 'some data yo!',
              lawfulBasis: 'CONSENT',
              jwks: {
                keys: [accountKey, myCvEducationKey]
              }
            },
            {
              id: '300b8097-53ba-49ee-8798-fc28170ea89c',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'PUBLISH',
              purpose: 'lägg ut!',
              lawfulBasis: 'CONSENT'
            }
          ]
        }
      }
      jwt.verify.mockResolvedValue({ payload: connection })

      dbAccounts = [{}]
      dbServices = [{}]
      dbConnections = []
      postgres.multiple.mockImplementation(async () => [
        { rows: dbAccounts },
        { rows: dbServices },
        { rows: dbConnections }
      ])

      jwks.getKeys.mockResolvedValue({
        'https://mycv.work/jwks/abcd': myCvEducationKey
      })

      res = {
        sendStatus: jest.fn().mockName('res.sendStatus')
      }
      next = jest.fn().mockName('next')
    })
    it('verifies payload', async () => {
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(jwt.verify).toHaveBeenCalledWith(connectionResponse.payload)
    })
    it('throws if payload verification fails', async () => {
      jwt.verify.mockRejectedValue(new Error())
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(next).toHaveBeenCalledWith(
        new Error('Could not verify CONNECTION_RESPONSE payload')
      )
    })
    it('checks db for existing account, service and connection', async () => {
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(sqlStatements.checkConnection).toHaveBeenCalledWith({
        accountId: connectionResponse.iss,
        serviceId: connection.aud
      })
      expect(postgres.multiple).toHaveBeenCalled()
    })
    it('throws if no account exists', async () => {
      dbAccounts = []
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(next).toHaveBeenCalledWith(
        new Error(`No such account ${connectionResponse.iss}`)
      )
    })
    it('throws if no service exists', async () => {
      dbServices = []
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(next).toHaveBeenCalledWith(
        new Error(`No such service ${connection.aud}`)
      )
    })
    it('throws if connection already exists', async () => {
      dbConnections = [{}]
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(next).toHaveBeenCalledWith(
        new Error('Connection already exists')
      )
    })
    it('creates sql for connection inserts', async () => {
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(sqlStatements.connectionInserts).toHaveBeenCalledWith({
        connectionId: '8953eb68-6eb0-4577-8b7d-a2599de962d4',
        accountId: 'egendata://account/9b517596-6348-4025-9324-9beefe2e4ac6',
        serviceId: 'https://mycv.work'
      })
    })
    it('retrieves all read keys', async () => {
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(jwks.getKeys).toHaveBeenCalledWith(['https://mycv.work/jwks/abcd'])
    })
    it('creates sql for permissions inserts', async () => {
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      const readKeys = {
        'https://mycv.work/jwks/abcd': myCvEducationKey
      }

      expect(sqlStatements.permissionsInserts).toHaveBeenCalledWith(
        connectionResponse, connection, readKeys
      )
    })
    it('runs inserts as transaction', async () => {
      const connectionInsertSql = 'INSERT INTO connections blah blah'
      const connectionInsertValues = [1, 2, 3]
      const permissionsInsertSql = 'INSERT INTO permissions blah blah'
      const permissionsInsertValues = [4, 5, 6]
      sqlStatements.connectionInserts.mockReturnValue([[connectionInsertSql, connectionInsertValues]])
      sqlStatements.permissionsInserts.mockReturnValue([[permissionsInsertSql, permissionsInsertValues]])

      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(postgres.transaction).toHaveBeenCalledWith([
        [connectionInsertSql, connectionInsertValues],
        [permissionsInsertSql, permissionsInsertValues]
      ])
    })
    it('creates a CONNECTION_EVENT', async () => {
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(tokens.createConnectionEvent).toHaveBeenCalledWith(
        'https://mycv.work',
        'connectionToken'
      )
    })
    it('sends CONNECTION_EVENT to service', async () => {
      dbServices = [{ events_uri: 'https://mycv.work/events' }]
      tokens.createConnectionEvent.mockResolvedValue('connection.event.token')

      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(axios.post).toHaveBeenCalledWith(
        'https://mycv.work/events',
        'connection.event.token',
        { headers: { 'content-type': 'application/jwt' } }
      )
    })
    it('responds with 201 CREATED if all goes well', async () => {
      await services.connectionResponse({ payload: connectionResponse }, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(201)
    })
  })
})
