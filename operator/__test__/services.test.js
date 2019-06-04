const services = require('../lib/services')
const sqlStatements = require('../lib/sqlStatements')

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
})
