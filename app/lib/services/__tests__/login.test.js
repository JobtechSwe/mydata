import * as loginService from '../../services/login'
import axios from 'axios'
import Config from 'react-native-config'
import { getAccount } from '../../services/storage'
import { Base64 } from 'js-base64'
import lolex from 'lolex'

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
    let account, clock
    beforeEach(() => {
      Config.OPERATOR_URL = 'aTotallyLegitOperatorUrl'
      account = {
        id: 'c1949de3-6662-43c9-8cc1-578169ea817b',
        keys: {
          publicKey: 'dis my public key yeah',
          privateKey: 'private keeeeeey',
        },
      }
      getAccount.mockResolvedValue(account)

      const now = new Date('2019-03-25T14:27:43.815Z').getTime()
      clock = lolex.install({
        now,
      })
    })
    afterEach(() => clock.uninstall())
    
    it('Posts to operator', async () => {
      await loginService.approve(loginRequest)
      expect(axios.post).toHaveBeenCalledWith(`aTotallyLegitOperatorUrl/accounts/${account.id}/login`, expect.anything())
    })

    it('Posts correct payload format to operator', async () => {
      await loginService.approve(loginRequest)
      const desiredPayload = {
        timestamp: '2019-03-25T14:27:43.815Z',
        clientId: 'https://cv.tld',
        sessionId: '5479744949494949949',
      }
      expect(axios.post).toHaveBeenCalledWith(expect.anything(), desiredPayload)
    })
  })
})
