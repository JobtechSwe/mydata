import { getAccount, getAccountKeys } from '../storage'
import * as tokens from '../tokens'
import { toPublicKey } from '../crypto'
import Config from 'react-native-config'
import { generateTestAccount, generateTestKey } from './_helpers'
import { v4 } from 'uuid'
import { verify } from '../jwt'

jest.mock('../storage', () => ({
  getAccount: jest.fn(),
  getAccountKeys: jest.fn(),
}))

jest.useFakeTimers()

describe('tokens', () => {
  let account, privateKey, publicKey

  beforeAll(async () => {
    Config.OPERATOR_URL = 'https://smoothoperator.work'

    privateKey = await generateTestKey({ use: 'sig' })
    publicKey = toPublicKey(privateKey)
    account = await generateTestAccount(privateKey.kid)
    getAccount.mockResolvedValue(account)
    getAccountKeys.mockResolvedValue({
      privateKey,
      publicKey,
    })
  })
  describe('ACCOUNT_REGISTRATION', () => {
    it('creates a valid token', async () => {
      const token = await tokens.createAccountRegistration(account, {
        publicKey,
        privateKey,
      })

      expect(token).toEqual(expect.any(String))
      await expect(verify(token)).resolves.not.toThrow()
    })
  })
  describe('CONNECTION_INIT', () => {
    it('creates a valid token', async () => {
      const authReq = {
        aud: 'mydata://account',
        iss: 'http://mycv.work',
        sid: '34567890',
      }
      const token = await tokens.createConnectionInit(authReq)
      expect(token).toEqual(expect.any(String))
    })
  })
  describe('CONNECTION', () => {
    it('creates a valid token', async () => {
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
        undefined,
        'e7c525c4-73a0-4838-9559-bc3c9eb76173'
      )

      expect(token).toEqual(expect.any(String))
      await expect(verify(token)).resolves.not.toThrow()
    })
    it('creates a valid token with permissions', async () => {
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
      await expect(verify(token)).resolves.not.toThrow()
    })
  })
  describe('LOGIN', () => {
    it('creates a valid token', async () => {
      const sessionId = 'yasdiuasdghuiasdads'
      const token = await tokens.createLogin(
        { serviceId: 'http://mycv.work', connectionId: v4() },
        sessionId
      )

      expect(token).toEqual(expect.any(String))
      await expect(verify(token)).resolves.not.toThrow()
    })
  })
  describe('LOGIN_RESPONSE', () => {
    it('creates a valid token', async () => {
      const token = await tokens.createLoginResponse('this-is.a-jwt.payload')

      expect(token).toEqual(expect.any(String))
      await expect(verify(token)).resolves.not.toThrow()
    })
  })
})
