import * as storage from '../../services/storage'
import { AsyncStorage } from 'react-native'

describe('storage', () => {
  let account
  beforeEach(() => {
    account = {
      firstName: 'Foo',
      lastName: 'Bar',
    }
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

    it('resolves with undefined if AsyncStorage rejects', async () => {
      AsyncStorage.getItem.mockRejectedValue('could not find any account')
      const result = await storage.getAccount()
      expect(result).toEqual(undefined)
    })
  })

  describe('#storeAccountId', () => {
    it('calls AsyncStorage.setItem', async () => {
      await storage.storeAccount(account)

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('account', JSON.stringify(account))
    })
  })
})
