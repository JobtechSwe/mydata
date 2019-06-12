import * as storage from '../storage'
import AsyncStorage from '@react-native-community/async-storage'
import { generateTestAccount, generateTestKey } from './_helpers'

describe('storage', () => {
  let account, key
  beforeAll(async () => {
    key = await generateTestKey({ use: 'enc' })
    account = await generateTestAccount()
  })

  describe('#storeAccountId', () => {
    it('calls AsyncStorage.setItem', async () => {
      await storage.storeAccount(account)

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'account',
        JSON.stringify(account)
      )
    })
  })
  describe('#getAccount', () => {
    it('calls AsyncStorage.getItem', async () => {
      await storage.getAccount()
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('account')
    })
    it('resolves if AsyncStorage resolves', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(account))
      const result = await storage.getAccount()
      expect(result).toEqual(account)
    })
  })
  describe('#storeKey', () => {
    it('calls AsyncStorage.setItem', async () => {
      await storage.storeKey(key)

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `jwks/${key.kid}`,
        JSON.stringify(key)
      )
    })
  })
  describe('#getPrivateKey', () => {
    it('calls AsyncStorage.getItem', async () => {
      await storage.getPrivateKey(key.kid)

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`jwks/${key.kid}`)
    })
    it('returns the private key', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(key))
      const result = await storage.getPrivateKey(key.kid)

      expect(result).toEqual(key)
    })
  })
  describe('#getPublicKey', () => {
    it('returns the public key', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(key))
      const result = await storage.getPublicKey(key.kid)
      const { e, kid, kty, n, use } = key

      expect(result).toEqual({ e, kid, kty, n, use })
    })
  })
  describe('#getAccountKeys', () => {
    it('returns the private and public keys for the account', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(account))
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(key))

      const { publicKey, privateKey } = await storage.getAccountKeys()

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('account')
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`jwks/${account.kid}`)

      expect(privateKey).toEqual(key)

      const { e, kid, kty, n, use } = key
      expect(publicKey).toEqual({ e, kid, kty, n, use })
    })
  })
})
