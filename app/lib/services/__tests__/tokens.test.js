import { getAccount } from '../account'
import * as tokens from '../tokens'
import Config from 'react-native-config'
import { generateTestAccount } from './_helpers'
import { v4 } from 'uuid'

jest.mock('../account', () => ({
  getAccount: jest.fn(),
}))

jest.useFakeTimers()

describe('tokens', () => {
  let account

  beforeAll(async () => {
    Config.OPERATOR_URL = 'https://smoothoperator.work'

    account = await generateTestAccount()
    getAccount.mockResolvedValue(account)
  })

  it('ACCOUNT_REGISTRATION', async () => {
    const token = await tokens.createAccountRegistration(account)
    expect(token).toEqual(expect.any(String))
  })

  it('CONNECTION_INIT', async () => {
    const authReq = { aud: 'mydata://account', iss: 'http://mycv.work', sid: '34567890' }
    const token = await tokens.createConnectionInit(authReq)
    expect(token).toEqual(expect.any(String))
  })

  it('LOGIN', async () => {
    const sessionId = 'yasdiuasdghuiasdads'
    const token = await tokens.createLogin( { serviceId: 'http://mycv.work', connectionId: v4() }, sessionId)
    expect(token).toEqual(expect.any(String))
  })

  it('LOGIN_RESPONSE', async () => {
    const token = await tokens.createLoginResponse('this-is-a-jwt-payload')
    expect(token).toEqual(expect.any(String))
  })
})
