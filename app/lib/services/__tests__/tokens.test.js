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
    const authReq = {
      aud: 'mydata://account',
      iss: 'http://mycv.work',
      sid: '34567890',
    }
    const token = await tokens.createConnectionInit(authReq)
    expect(token).toEqual(expect.any(String))
  })

  it('CONNECTION', async () => {
    const connectionRequest = {
      aud: 'mydata://account',
      exp: 12331354544,
      iat: 12331354541,
      iss: 'http://mycv.work',
      type: 'CONNECTION_REQUEST',
      sid: 'e6fb637d-200e-4895-b02b-ab9b3449b181',
      displayName: 'MyCV - The sexy CV site!',
      description: 'A service for generating CVs',
      iconURI: 'http://mycv.work/icon.png',
    }
    const token = await tokens.createConnection(
      connectionRequest,
      {},
      'e7c525c4-73a0-4838-9559-bc3c9eb76173'
    )
    expect(token).toEqual(expect.any(String))
  })

  it('CONNECTION with permissions', async () => {
    const { permissions, ...connectionRequest } = {
      aud: 'mydata://account',
      exp: 12331354544,
      iat: 12331354541,
      iss: 'http://mycv.work',
      type: 'CONNECTION_REQUEST',
      permissions: {
        approved: [
          {
            domain: 'http://mycv.work',
            area: 'animal_litter_pictures',
            id: '4b2aeb88-0837-4bf8-abf3-6ee460598adb',
            type: 'READ',
            lawfulBasis: 'CONSENT',
            kid: 'http://mycv.work/jwks/enc_9awsfdu9fjd9jfjjjfffffffffFFF',
            purpose: 'In order to create a CV using our website.',
          },
        ],
      },
      sid: 'e6fb637d-200e-4895-b02b-ab9b3449b181',
      displayName: 'MyCV - The sexy CV site!',
      description: 'A service for generating CVs',
      iconURI: 'http://mycv.work/icon.png',
    }
    const token = await tokens.createConnection(
      connectionRequest,
      permissions,
      'e7c525c4-73a0-4838-9559-bc3c9eb76173'
    )
    expect(token).toEqual(expect.any(String))
  })

  it('LOGIN', async () => {
    const sessionId = 'yasdiuasdghuiasdads'
    const token = await tokens.createLogin(
      { serviceId: 'http://mycv.work', connectionId: v4() },
      sessionId
    )
    expect(token).toEqual(expect.any(String))
  })

  it('LOGIN_RESPONSE', async () => {
    const token = await tokens.createLoginResponse('this-is.a-jwt.payload')
    expect(token).toEqual(expect.any(String))
  })
})
