import * as consentService from '../consents'
import Config from 'react-native-config'
import axios from 'axios'
import { getAccount } from '../storage'
import { getKey } from '../jwks'
import { generateKeys, sign } from '../crypto'

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))
jest.mock('../storage', () => ({
  getAccount: jest.fn(),
}))
jest.mock('../jwks', () => ({
  getKey: jest.fn(),
}))

Config.OPERATOR_URL = 'https://smoothoperator.work'
jest.useFakeTimers()

describe('consentService', () => {
  let account, consentRequest, keyPair
  beforeAll(async () => {
    keyPair = await generateKeys(1024)
  })
  beforeEach(() => {
    account = {
      id: 'account-id',
    }
    consentRequest = { }
    getAccount.mockResolvedValue(account)
    axios.get.mockImplementation(async () => ({
      data: {
        data: consentRequest,
        signature: await sign(consentRequest, 'client_key', keyPair.privateKey),
      },
    }))
  })
  describe('#get', () => {
    let consentId
    describe('register', () => {
      beforeEach(() => {
        consentId = 'abc-123'
        getKey.mockResolvedValue(keyPair)
      })
      it('throws if account does not exist', async () => {
        getAccount.mockResolvedValue()
        await expect(consentService.get(consentId)).rejects.toThrow('Account is not set')
      })
      it('throws if account lacks id', async () => {
        account.id = undefined
        await expect(consentService.get(consentId)).rejects.toThrow('Account is not set')
      })
      it('loads the consent with user id as request param', async () => {
        await consentService.get(consentId)
        const expectedUrl = 'https://smoothoperator.work/consents/requests/abc-123?accountId=account-id'
        expect(axios.get).toHaveBeenCalledWith(expectedUrl)
      })
    })
  })

  describe('#getAll', () => {
    describe('register', () => {
      beforeEach(() => {
      })
      it('throws if account does not exist', async () => {
        getAccount.mockResolvedValue()
        await expect(consentService.getAll()).rejects.toThrow('Account is not set')
      })
      it('throws if account lacks id', async () => {
        account.id = undefined
        await expect(consentService.getAll()).rejects.toThrow('Account is not set')
      })
      it('does get request', async () => {
        await consentService.getAll()
        expect(axios.get).toHaveBeenCalled()
      })
    })
  })
  describe('#approve', () => {
    it('works', () => {})
  })
})
