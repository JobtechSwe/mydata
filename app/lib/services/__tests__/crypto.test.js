import { RSA } from 'react-native-rsa-native'
import { sign, verify } from '../services/crypto'

describe('services/crypto', () => {
  let keys
  beforeAll(async () => {
    keys = await RSA.generateKeys(1024)
  })

  describe('sign', () => {
    let data
    beforeEach(() => {
      data = {
        foo: 'bar',
      }
    })

    it('generates valid signature', async () => {
      const result = await sign(data, 'account_key', keys.private)
      const expectedResult = {
        alg: 'RSA-SHA512',
        kid: 'account_key',
        data: await RSA.sign(JSON.stringify(data), keys.private),
      }

      expect(result).toEqual(expectedResult)
    })

    describe('verify', () => {
      it('verifies a correctly signed payload', async () => {
        const signature = await sign(data, 'account_key', keys.private)
        const result = await verify(data, signature, keys.public)

        expect(result).toBe(true)
      })

      it('throws if alg is unsupported', () => {
        return expect(verify(data, { alg: 'RSA-SHA256' }, keys.public))
          .rejects.toThrowError('Unsupported algorithm [RSA-SHA256]. Only [RSA-SHA512] is supported.')
      })

      it('throws if alg is omitted', () => {
        return expect(verify(data, { }, keys.public))
          .rejects.toThrowError('Signature algorithm must be specified. Only [RSA-SHA512] is supported.')
      })

      it('returns false if signature is wrong', async () => {
        const signature = await sign(data, 'account_key', keys.private)
        signature.data = 'herp-derp'
        const result = await verify(data, signature, keys.public)

        expect(result).toBe(false)
      })

      it('returns false if key is wrong', async () => {
        const signature = await sign(data, 'account_key', keys.private)

        const otherKeys = await RSA.generateKeys(1024)
        const result = await verify(data, signature, otherKeys.public)

        expect(result).toBe(false)
      })
    })
  })
  xdescribe('encrypt', () => {
    it('works', () => { })
  })
  xdescribe('decrypt', () => {
    it('works', () => { })
  })
})
