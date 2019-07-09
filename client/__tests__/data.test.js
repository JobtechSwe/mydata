const { JWE, JWS, JWK } = require('@panva/jose')
const data = require('../lib/data')
const { generateKey, toPublicKey } = require('../lib/crypto')
const { verify } = require('../lib/jwt')

jest.mock('../lib/jwt', () => ({
  verify: jest.fn().mockName('jwt.verify')
}))

describe('data', () => {
  let signingKey, accountEncryptionKey, serviceEncryptionKey
  beforeAll(async () => {
    signingKey = await generateKey('https://mycv.work', { use: 'sig' })
    accountEncryptionKey = await generateKey('egendata://jwks', { use: 'enc' })
    serviceEncryptionKey = await generateKey('https://mycv.work/jwks', { use: 'enc' })
  })

  let config, keyProvider, tokens
  let connectionId, domain, area, payload
  let read, write, auth
  beforeEach(() => {
    config = {
      clientId: 'https://mycv.work',
      jwksURI: 'https://mycv.work/jwks',
      operator: 'https://smoothoperator.com'
    }
    keyProvider = {
      getSigningKey: jest.fn().mockName('keyProvider.getSigningKey')
        .mockResolvedValue(signingKey),
      getWriteKeys: jest.fn().mockName('keyProvider.getWriteKeys')
        .mockResolvedValue({
          keys: [
            toPublicKey(accountEncryptionKey),
            toPublicKey(serviceEncryptionKey)
          ]
        }),
      getKey: jest.fn().mockName('keyProvider.getKey')
        .mockResolvedValue(serviceEncryptionKey)
    }
    tokens = {
      createWriteDataToken: jest.fn().mockName('tokens.createWriteDataToken')
        .mockResolvedValue('write.data.token'),
      createReadDataToken: jest.fn().mockName('tokens.createReadDataToken')
        .mockResolvedValue('read.data.token'),
      send: jest.fn().mockName('tokens.send')
        .mockResolvedValue({})
    }
    const client = { config, keyProvider, tokens }
    ;({ auth, read, write } = data(client))

    connectionId = 'd52da47c-8895-4db8-ae04-7434f21fd118'
    domain = 'https://somotherdomain.org'
    area = 'edumacation'
    payload = ['some', 'stuff']
  })
  describe('#write', () => {
    it('creates a token with the correct arguments', async () => {
      await write(connectionId, { domain, area, data: payload })

      expect(tokens.createWriteDataToken).toHaveBeenCalledWith(
        connectionId, [ { domain, area, data: expect.any(Object) } ]
      )
    })
    it('creates a token with the correct arguments without domain', async () => {
      await write(connectionId, { area, data: payload })

      expect(tokens.createWriteDataToken).toHaveBeenCalledWith(
        connectionId, [
          { domain: config.clientId, area, data: expect.any(Object) }
        ]
      )
    })
    it('creates a correct token with multiple paths', async () => {
      const area2 = 'experience'
      await write(connectionId,
        { area, data: payload },
        { area: area2, data: payload })

      expect(tokens.createWriteDataToken).toHaveBeenCalledWith(
        connectionId, [
          { domain: config.clientId, area, data: expect.any(Object) },
          { domain: config.clientId, area: area2, data: expect.any(Object) }
        ]
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
  describe('#read', () => {
    let data
    function createJWE (data) {
      const signed = JWS.sign(JSON.stringify(data), JWK.importKey(signingKey), { kid: signingKey.kid })
      const encryptor = new JWE.Encrypt(signed)
      encryptor.recipient(JWK.importKey(toPublicKey(accountEncryptionKey)),
        { kid: accountEncryptionKey.kid })
      encryptor.recipient(JWK.importKey(toPublicKey(serviceEncryptionKey)),
        { kid: serviceEncryptionKey.kid })
      return encryptor.encrypt('general')
    }
    describe('with data', () => {
      beforeEach(() => {
        data = ['I love horses']
        tokens.send.mockResolvedValue('read.response.token')
        verify.mockImplementation(() => ({
          payload: {
            paths: [ { domain, area, data: createJWE(data) } ]
          }
        }))
      })
      it('creates a token with the correct arguments', async () => {
        await read(connectionId, { domain, area })

        expect(tokens.createReadDataToken).toHaveBeenCalledWith(
          connectionId, [ { domain, area } ]
        )
      })
      it('creates a token with the correct arguments without domain', async () => {
        await read(connectionId, { area })

        expect(tokens.createReadDataToken).toHaveBeenCalledWith(
          connectionId, [ { domain: config.clientId, area } ]
        )
      })
      it('creates a token with the correct arguments with multiple paths', async () => {
        await read(connectionId, { area }, { domain, area: 'experience' })

        expect(tokens.createReadDataToken).toHaveBeenCalledWith(
          connectionId, [
            { domain: config.clientId, area },
            { domain, area: 'experience' }
          ]
        )
      })
      it('posts to operator', async () => {
        await read(connectionId, { domain, area })

        expect(tokens.send).toHaveBeenCalledWith(
          'https://smoothoperator.com/api',
          'read.data.token'
        )
      })
      it('verifies the returned payload', async () => {
        await read(connectionId, { domain, area })

        expect(verify).toHaveBeenCalledWith('read.response.token')
      })
      it('gets the correct decryption key', async () => {
        await read(connectionId, { domain, area })

        expect(keyProvider.getKey).toHaveBeenCalledWith(serviceEncryptionKey.kid)
      })
      it('decrypts, parses and returns the data', async () => {
        const [decrypted] = await read(connectionId, { domain, area })

        expect(decrypted).toEqual({ domain, area, data })
      })
    })
    describe('without data', () => {
      beforeEach(() => {
        tokens.send.mockResolvedValue('read.response.token')
        verify.mockImplementation(() => ({
          payload: {
            paths: [ { domain, area } ]
          }
        }))
      })
      it('creates a token with the correct arguments', async () => {
        await read(connectionId, { domain, area })

        expect(tokens.createReadDataToken).toHaveBeenCalledWith(
          connectionId, [ { domain, area } ]
        )
      })
      it('creates a token with the correct arguments without domain', async () => {
        await read(connectionId, { area })

        expect(tokens.createReadDataToken).toHaveBeenCalledWith(
          connectionId, [ { domain: config.clientId, area } ]
        )
      })
      it('posts to operator', async () => {
        await read(connectionId, { domain, area })

        expect(tokens.send).toHaveBeenCalledWith(
          'https://smoothoperator.com/api',
          'read.data.token'
        )
      })
      it('verifies the returned payload', async () => {
        await read(connectionId, { domain, area })

        expect(verify).toHaveBeenCalledWith('read.response.token')
      })
    })
  })
  describe('#auth', () => {
    let accessToken
    beforeEach(() => {
      accessToken = 'access.token'
      verify.mockResolvedValue({ payload: { sub: connectionId } })
    })
    describe('#write', () => {
      it('calls verify to unpack the access token', async () => {
        await auth(accessToken).write({ domain, area, data: payload })

        expect(verify).toHaveBeenCalledWith(accessToken)
      })
      it('creates a token with the correct arguments', async () => {
        await auth(accessToken).write({ domain, area, data: payload })

        expect(tokens.createWriteDataToken).toHaveBeenCalledWith(
          connectionId, [ { domain, area, data: expect.any(Object) } ]
        )
      })
      it('creates a token with the correct arguments without domain', async () => {
        await auth(accessToken).write({ area, data: payload })

        expect(tokens.createWriteDataToken).toHaveBeenCalledWith(
          connectionId, [ { domain: config.clientId, area, data: expect.any(Object) } ]
        )
      })
      it('posts to operator', async () => {
        await auth(accessToken).write({ domain, area, data: payload })

        expect(tokens.send).toHaveBeenCalledWith(
          'https://smoothoperator.com/api',
          'write.data.token'
        )
      })
    })
    describe('#read', () => {
      let data
      function createJWE (data) {
        const signed = JWS.sign(JSON.stringify(data), JWK.importKey(signingKey), { kid: signingKey.kid })
        const encryptor = new JWE.Encrypt(signed)
        encryptor.recipient(JWK.importKey(toPublicKey(accountEncryptionKey)),
          { kid: accountEncryptionKey.kid })
        encryptor.recipient(JWK.importKey(toPublicKey(serviceEncryptionKey)),
          { kid: serviceEncryptionKey.kid })
        return encryptor.encrypt('general')
      }
      describe('with data', () => {
        beforeEach(() => {
          data = ['I love horses']
          tokens.send.mockResolvedValue('read.response.token')
          verify.mockImplementation(async (token) => {
            switch (token) {
              case 'access.token':
                return { payload: { sub: connectionId } }
              case 'read.response.token':
                return { payload: {
                  paths: [ { domain, area, data: createJWE(data) } ]
                } }
              default:
                throw new Error('Unmocked token')
            }
          })
        })
        it('calls verify to unpack the access token', async () => {
          await auth(accessToken).read({ domain, area })

          expect(verify).toHaveBeenCalledWith(accessToken)
        })
        it('creates a token with the correct arguments', async () => {
          await auth(accessToken).read({ domain, area })

          expect(tokens.createReadDataToken).toHaveBeenCalledWith(
            connectionId, [ { domain, area } ]
          )
        })
        it('creates a token with the correct arguments without domain', async () => {
          await auth(accessToken).read({ area })

          expect(tokens.createReadDataToken).toHaveBeenCalledWith(
            connectionId, [ { domain: config.clientId, area } ]
          )
        })
        it('posts to operator', async () => {
          await auth(accessToken).read({ domain, area })

          expect(tokens.send).toHaveBeenCalledWith(
            'https://smoothoperator.com/api',
            'read.data.token'
          )
        })
        it('verifies the returned payload', async () => {
          await auth(accessToken).read({ domain, area })

          expect(verify).toHaveBeenCalledWith('read.response.token')
        })
        it('gets the correct decryption key', async () => {
          await auth(accessToken).read({ domain, area })

          expect(keyProvider.getKey).toHaveBeenCalledWith(serviceEncryptionKey.kid)
        })
        it('decrypts, parses and returns the data', async () => {
          const [decrypted] = await auth(accessToken).read({ domain, area })

          expect(decrypted).toEqual({ domain, area, data })
        })
      })
      describe('without data', () => {
        beforeEach(() => {
          tokens.send.mockResolvedValue('read.response.token')
          verify.mockImplementation(async (token) => {
            switch (token) {
              case 'access.token':
                return { payload: { sub: connectionId } }
              case 'read.response.token':
                return { payload: { paths: [ { domain, area } ] } }
              default:
                throw new Error('Unmocked token')
            }
          })
        })
        it('calls verify to unpack the access token', async () => {
          await auth(accessToken).read({ domain, area })

          expect(verify).toHaveBeenCalledWith(accessToken)
        })
        it('creates a token with the correct arguments', async () => {
          await auth(accessToken).read({ domain, area })

          expect(tokens.createReadDataToken).toHaveBeenCalledWith(
            connectionId, [ { domain, area } ]
          )
        })
        it('creates a token with the correct arguments without domain', async () => {
          await auth(accessToken).read({ area })

          expect(tokens.createReadDataToken).toHaveBeenCalledWith(
            connectionId, [ { domain: config.clientId, area } ]
          )
        })
        it('posts to operator', async () => {
          await auth(accessToken).read({ domain, area })

          expect(tokens.send).toHaveBeenCalledWith(
            'https://smoothoperator.com/api',
            'read.data.token'
          )
        })
        it('verifies the returned payload', async () => {
          await auth(accessToken).read({ domain, area })

          expect(verify).toHaveBeenCalledWith('read.response.token')
        })
        it('returns undefined', async () => {
          const [decrypted] = await auth(accessToken).read({ domain, area })

          expect(decrypted).toEqual({ domain, area })
        })
      })
    })
  })
})
