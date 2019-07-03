const data = require('../lib/data')
const { generateKey, toPublicKey } = require('../lib/crypto')

describe('data', () => {
  let signingKey, accountWriteKey, serviceWriteKey
  beforeAll(async () => {
    signingKey = await generateKey('https://mycv.work', { use: 'sig' })
    accountWriteKey = await generateKey('egendata://jwks', { use: 'enc' })
    serviceWriteKey = await generateKey('https://mycv.work/jwks', { use: 'enc' })
  })

  let config, keyProvider, tokens
  let connectionId, domain, area, payload
  let read, write
  beforeEach(() => {
    config = {
      clientId: 'https://mycv.work',
      operator: 'https://smoothoperator.com'
    }
    keyProvider = {
      getSigningKey: jest.fn().mockName('keyProvider.getSigningKey')
        .mockResolvedValue(signingKey),
      getWriteKeys: jest.fn().mockName('keyProvider.getWriteKeys')
        .mockResolvedValue({
          keys: [
            toPublicKey(accountWriteKey),
            toPublicKey(serviceWriteKey)
          ]
        })
    }
    tokens = {
      createWriteDataToken: jest.fn().mockName('tokens.createWriteDataToken')
        .mockResolvedValue('write.data.token'),
      send: jest.fn().mockName('tokens.send')
        .mockResolvedValue({})
    }
    const client = { config, keyProvider, tokens }
    ;({ read, write } = data(client))

    connectionId = 'd52da47c-8895-4db8-ae04-7434f21fd118'
    domain = 'https://somotherdomain.org'
    area = 'edumacation'
    payload = ['some', 'stuff']
  })
  describe('#write', () => {
    it('creates a token with the correct arguments', async () => {
      await write(connectionId, { domain, area, data: payload })

      expect(tokens.createWriteDataToken).toHaveBeenCalledWith(
        connectionId, domain, area, expect.any(String)
      )
    })
    it('posts to operator', async () => {
      await write(connectionId, { domain, area, data: payload })

      expect(tokens.send).toHaveBeenCalledWith(
        'https://smoothoperator.com/api',
        'write.data.token'
      )
    })
  })
})
