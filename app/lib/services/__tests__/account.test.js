import * as accountService from '../account'
import axios from 'axios'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-community/async-storage'
import { generateTestAccount } from './_helpers'

Config.OPERATOR_URL = 'aTotallyLegitOperatorUrl'

describe('account', () => {
  let account
  beforeEach(async () => {
    account = await generateTestAccount()
  })

  describe('#register', () => {
    beforeEach(() => {
      account.id = undefined
      axios.post.mockResolvedValue({ data: { data: { id: 'abc123' } } })
    })
    it('calls axios.post', async () => {
      await accountService.register(account)

      expect(axios.post).toHaveBeenCalled()
    })
    it('returns id axios.post resolves', async () => {
      const id = await accountService.register(account)

      expect(id).toEqual(expect.any(String))
    })
  })

  describe('#save', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({ data: { data: { id: 'abc123' } } })
      axios.put.mockResolvedValue({})
    })
    describe('new user', () => {
      beforeEach(() => {
        account.id = undefined
      })
      it('returns account', async () => {
        const result = await accountService.save(account)

        expect(result).toEqual(account)
      })
    })
  })

  describe('#getAccount', () => {
    it('calls AsyncStorage.getItem', async () => {
      await accountService.getAccount()
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('account')
    })

    it('resolves if AsyncStorage resolves', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(account))
      const result = await accountService.getAccount()
      expect(result).toEqual(account)
    })

    it('resolves with undefined if AsyncStorage rejects', async () => {
      AsyncStorage.getItem.mockRejectedValue('could not find any account')
      const result = await accountService.getAccount()
      expect(result).toEqual(undefined)
    })
  })
})
