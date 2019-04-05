process.env.CLIENT_ID = 'http://cool-service.invalid'
const { loginRequest } = require('../../../api/services/login')
jest.mock('uuid')
const uuid = require('uuid')
uuid.v4.mockReturnValue('a_v4_uuid')

describe('loginRequest', () => {
  it('creates a correct login request url', () => {
    const sessionId = `session_${uuid.v4()}`
    const url = 'mydata://login/eyJzZXNzaW9uSWQiOiJzZXNzaW9uX2FfdjRfdXVpZCIsImNsaWVudElkIjoiaHR0cDovL2Nvb2wtc2VydmljZS5pbnZhbGlkIn0'
    const expected = {
      sessionId,
      url
    }

    return expect(loginRequest()).toEqual(expected)
  })
})
