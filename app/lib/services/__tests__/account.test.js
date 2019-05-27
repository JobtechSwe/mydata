import * as accountService from '../account'
import axios from 'axios'
import { RSA } from 'react-native-rsa-native'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-community/async-storage'

Config.OPERATOR_URL = 'aTotallyLegitOperatorUrl'

describe('account', () => {
  let account
  beforeEach(async () => {
    const keys = await RSA.generateKeys(1024)
    account = {
      id: 'abc123',
      firstName: 'Foo',
      lastName: 'Bar',
      pds: {
        provider: 'dropbox',
        access_token: 'abc',
      },
      keys: {
        publicKey: keys.public,
        privateKey: keys.private,
      },
    }
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

  describe('#update', () => {
    beforeEach(() => {
      axios.put.mockResolvedValue({})
    })
    it('calls axios.put', async () => {
      await accountService.update(account)

      expect(axios.put).toHaveBeenCalled()
    })
  })

  describe('#save', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({ data: { data: { id: 'abc123' } } })
      axios.put.mockResolvedValue({})
    })
    describe('existing user', () => {
      it('calls axios.put to correct url and with parts of account as payload', async () => {
        await accountService.save(account)

        const expected = {
          data: {
            firstName: account.firstName,
            lastName: account.lastName,
            accountKey: Buffer.from(account.keys.publicKey).toString('base64'),
            pds: {
              provider: 'dropbox',
              access_token: account.pds.access_token,
            },
          },
          signature: {
            alg: 'RSA-SHA512',
            kid: 'account_key',
            data: expect.any(String),
          },
        }
        expect(axios.put).toHaveBeenCalledWith(
          'aTotallyLegitOperatorUrl/accounts/abc123',
          expected
        )
      })
      it('returns account', async () => {
        const result = await accountService.save(account)

        expect(result).toEqual(account)
      })
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
