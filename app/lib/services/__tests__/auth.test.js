import { initConnection } from '../auth'
import { getAccount } from '../account'
import axios from 'axios'
import { RSA } from 'react-native-rsa-native'
import pem2jwk from 'simple-pem2jwk'

jest.mock('../account', () => ({
  getAccount: jest.fn(),
}))

jest.mock('../tokens', () => ({
  createConnectionInit: jest.fn().mockResolvedValue('this-is-a-jwt'),
}))

jest.mock('../jwt', () => ({
  verify: jest.fn().mockResolvedValue({ payload: { foo: 'bar' } }),
}))

jest.useFakeTimers()

describe('auth', () => {
  let account

  beforeAll(async () => {
    const keys = await RSA.generateKeys(1024)
    account = {
      id: 'foo',
      keys: {
        privateKey: pem2jwk(keys.private),
        publicKey: pem2jwk(keys.public, { use: 'sig' }),
      },
    }

    getAccount.mockResolvedValue(account)
  })

  describe('#initConnection', () => {
    it('posts to correct url with correct content type', async () => {
      const authRequest = {
        aud: 'mydata://account',
        description: 'An app for your CV online',
        eventsURI: 'http://localhost:4000/events',
        exp: 1556946770839,
        iss: 'http://localhost:4000',
        sid: '5e6f8512-b2c1-48f9-adda-17026cd84856',
        name: 'My CV',
        type: 'AUTHENTICATION_REQUEST',
      }

      await initConnection(authRequest)

      expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/events', 'this-is-a-jwt', { headers: { 'content-type': 'application/jwt' } })
    })
  })
})
