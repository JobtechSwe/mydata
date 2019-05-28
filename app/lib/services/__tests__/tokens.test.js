import { getAccount } from '../account'
import * as tokens from '../tokens'
import Config from 'react-native-config'
import { generateTestAccount } from './_helpers'

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
})
