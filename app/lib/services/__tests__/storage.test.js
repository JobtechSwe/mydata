import * as storage from '../storage'
import AsyncStorage from '@react-native-community/async-storage'

describe('storage', () => {
  let account
  beforeEach(() => {
    account = {
      firstName: 'Foo',
      lastName: 'Bar',
    }
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
