import * as consentService from '../consents'
import Config from 'react-native-config'
import axios from 'axios'
import { getAccount } from '../account'
import { getKey } from '../jwks'
import { generateKeys, sign } from '../crypto'

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))
jest.mock('../account', () => ({
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
  beforeEach(async () => {
    account = {
      id: 'account-id',
    }
    getAccount.mockResolvedValue(account)

    const data = {
      clientId: 'https://mycv.work',
      scope: [
        {
          domain: 'https://mycv.work',
          area: 'education',
          decription: 'Utbildning',
          purpose: 'För att bygga ditt CV',
          permissions: ['READ', 'WRITE'],
          lawfulBasis: 'CONSENT',
        },
        {
          domain: 'https://otherservice.com',
          area: 'name',
          decription: 'Namn',
          purpose: 'För att bygga ditt CV',
          permissions: ['READ'],
          lawfulBasis: 'CONSENT',
        },
      ],
    }
    const signature = await sign(data, 'client_key', keyPair.privateKey)
    const clients = {
      'https://mycv.work': {
        displayName: 'Mitt CV',
        description: 'En app för ditt online-CV',
        jwksUrl: 'https://mycv.work/jwks',
      },
      'https://otherservice.com': {
        displayName: 'Annan tjänst',
        description: 'Bra grejer',
        jwksUrl: 'https://otherservice.com/jwks',
      },
    }
    consentRequest = { data, signature, clients }
    axios.get.mockImplementation(async () => ({ data: consentRequest }))
  })
  describe('#get', () => {
    let consentRequestId
    describe('register', () => {
      beforeEach(() => {
        consentRequestId = 'abc-123'
        getKey.mockResolvedValue(keyPair)
      })
      it('throws if account does not exist', async () => {
        getAccount.mockResolvedValue()
        await expect(consentService.get(consentRequestId)).rejects.toThrow('Account is not set')
      })
      it('throws if account lacks id', async () => {
        account.id = undefined
        await expect(consentService.get(consentRequestId)).rejects.toThrow('Account is not set')
      })
      it('loads the consent with user id as request param', async () => {
        await consentService.get(consentRequestId)
        const expectedUrl = 'https://smoothoperator.work/consents/requests/abc-123?accountId=account-id'
        expect(axios.get).toHaveBeenCalledWith(expectedUrl)
      })
      it('returns the correct data', async () => {
        const result = await consentService.get(consentRequestId)
        expect(result).toEqual({
          consentRequestId,
          data: consentRequest.data,
          clients: consentRequest.clients,
        })
      })
    })
  })
  describe('#approve', () => {
    it('works', () => {})
  })
})
