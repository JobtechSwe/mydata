import * as loginService from '../../services/login'
import axios from 'axios'
import Config from 'react-native-config'
import { getAccount } from '../../services/storage'
import { Base64 } from 'js-base64'

jest.mock('../../services/storage')

describe('loginService', () => {
  let loginRequest
  beforeEach(() => {
    loginRequest = {
      clientId: 'https://cv.tld',
      sessionId: '5479744949494949949',
    }
  })
  const encode = (req) => Base64.encodeURI(JSON.stringify(req))

  describe('#parse', () => {
    it('Parses a login request string', async () => {
      const result = loginService.parse(encode(loginRequest))
      expect(result).toEqual(loginRequest)
    })

    it('Throws on malformed request', async () => {
      expect(() => loginService.parse('not_even_json')).toThrow()

      const malformed1 = {
        hest: 'pony',
      }
      expect(() => loginService.parse(encode(malformed1))).toThrow()

      const noClientId = {
        sessionId: '5479744949494949949',
      }
      expect(() => loginService.parse(encode(noClientId))).toThrow()

      const noSessionId = {
        clientId: 'https://cv.tld',
      }
      expect(() => loginService.parse(encode(noSessionId))).toThrow()
    })
  })

  describe('#approve', () => {
    Config.OPERATOR_URL = 'aTotallyLegitOperatorUrl'
    const account = {
      id: 'c1949de3-6662-43c9-8cc1-578169ea817b',
      keys: {
        publicKey: 'dis my public key yeah',
        privateKey: 'private keeeeeey',
      },
    }
    getAccount.mockResolvedValue(account)
    /*
    todo: get consent from operator, extract consentId
    todo: sign
     */
    it('Posts to operator', async () => {
      await loginService.approve(loginRequest)
      expect(axios.post).toBeCalledWith(`aTotallyLegitOperatorUrl/accounts/${account.id}/login`, expect.anything())
    })

    it('Posts correct payload format to operator', async () => {
      Date.now = jest.fn(() => 55555)
      await loginService.approve(loginRequest)
      const desiredPayload = {
        timeStamp: 55555,
        clientId: 'https://cv.tld',
        sessionId: '5479744949494949949',
        // consentId: '31337', // todo: add
        // signature: <signed with accountKey> // todo: add
      }
      expect(axios.post).toBeCalledWith(expect.anything(), desiredPayload)
    })
  })
})
