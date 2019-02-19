import * as consentService from '../../services/consents'
import axios from 'axios'
import Config from 'react-native-config'
import { getAccount } from '../../services/storage'

jest.mock('../../services/storage')
Config.OPERATOR_URL = 'aTotallyLegitOperatorUrl'
jest.useFakeTimers()

describe.skip('consentService', () => {
  const account = {
    id: 'c1949de3-6662-43c9-8cc1-578169ea817b',
    keys: {
      publicKey: 'dis my public key yeah',
      privateKey: 'private keeeeeey'
    }
  }
  let consentRequest, jwks
  beforeEach(async () => {
    getAccount.mockResolvedValue(account)
    axios.get.mockImplementation((url) => {
      if (/\/consents\/requests\//.test(url)) {
        return Promise.resolve({ data: consentRequest })
      } else if (/\/jwks\/client_key/.test(url)) {
        return Promise.resolve({ data: jwks.keys[0] })
      } else {
        return Promise.reject(Object.assign(new Error(), { status: 404 }))
      }
    })
    axios.post.mockResolvedValue({})
  })

  it('has no tests :(', () => {
    // this is needed to make jest not fail with 'test suite must contain at least one test'
  })
})
