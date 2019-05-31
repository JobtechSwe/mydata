import * as storage from '../storage'
import AsyncStorage from '@react-native-community/async-storage'
import { generateTestAccount } from './_helpers'

describe('storage', () => {
  let account
  beforeEach(async () => {
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
})
