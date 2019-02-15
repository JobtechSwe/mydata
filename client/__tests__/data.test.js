const dataService = require('../lib/data')
const axios = require('axios')
const { sign } = require('jsonwebtoken')
const KeyProvider = require('../lib/keyProvider')
const MemoryKeyValueStore = require('../lib/memoryKeyValueStore')
const crypto = require('../lib/crypto')
const { generateKeyPair, jsonToBase64, base64ToJson } = require('./_helpers')
jest.mock('axios')

describe('data', () => {
  let consentId, domain, consentKeys, accountKey, otherServiceKey
  beforeAll(async () => {
    domain = 'http://cv.work:4000'
    consentId = '528adc99-e899-422f-a0f2-a95d3a066464'
    consentKeys = await generateKeyPair({
      kid: `${domain}/jwks/enc_consent-keys`
    })
    accountKey = await generateKeyPair({
      kid: `mydata://${consentId}/account-key`
    })
    otherServiceKey = await generateKeyPair({
      kid: `https://some-other-service/jwks/enc_some-key`
    })
  })

  let config, accessToken, keyProvider, area1, area2
  beforeEach(async () => {
    const keyValueStore = new MemoryKeyValueStore()
    keyProvider = new KeyProvider({
      clientKeys: {},
      keyOptions: {},
      jwksUrl: `${domain}/jwks`,
      keyValueStore
    })
    config = { operator: 'http://localhost:3000' }
    accessToken = sign({ data: { consentId } }, 'secret')

    await keyProvider.saveKey(consentKeys)
    await keyProvider.saveKey({ kid: accountKey.kid, publicKey: accountKey.publicKey })
    await keyProvider.saveKey({ kid: otherServiceKey.kid, publicKey: otherServiceKey.publicKey })

    area1 = 'education'
    area2 = 'experience'
    await keyProvider.saveAccessKeyIds(consentId, domain, area1, [
      consentKeys.kid, accountKey.kid
    ])
    await keyProvider.saveAccessKeyIds(consentId, domain, area2, [
      consentKeys.kid, accountKey.kid, otherServiceKey.kid
    ])
  })

  describe('#read', () => {
    let read
    beforeEach(() => {
      axios.get = jest.fn()
      read = dataService({ config, keyProvider })
        .auth(accessToken)
        .read
    })

    it('calls axios.get with correct url and header for root', async () => {
      axios.get.mockResolvedValue({ data: { foo: 'bar' } })
      await read({})

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/data/`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } })
    })

    it('calls axios.get with correct url and header for domain', async () => {
      axios.get.mockResolvedValue({ data: { foo: 'bar' } })
      await read({ domain: 'cv.work:4000' })

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/data/${encodeURIComponent('cv.work:4000')}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } })
    })

    it('calls axios.get with correct url and header for domain and area', async () => {
      axios.get.mockResolvedValue({ data: { foo: 'bar' } })
      await read({ domain: 'cv.work:4000', area: 'cv' })

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/data/${encodeURIComponent('cv.work:4000')}/${encodeURIComponent('cv')}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } })
    })

    it('returns data', async () => {
      axios.get.mockResolvedValue({ data: { foo: 'bar' } })

      const result = await read({ domain: 'cv', area: '/foo' })

      expect(result).toEqual({ foo: 'bar' })
    })
  })

  describe('#write', () => {
    let write
    beforeEach(() => {
      axios.post = jest.fn()
      write = dataService({ config, keyProvider })
        .auth(accessToken)
        .write
    })

    it('calls axios.post with correct url and header', async () => {
      const data = { foo: 'bar' }
      await write({ domain, area: area1, data })

      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:3000/api/data/${encodeURIComponent(domain)}/${encodeURIComponent(area1)}`,
        expect.any(String),
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
    })
    describe('new document', () => {
      it('generates document keys', async () => {
        const data = { foo: 'bar' }
        await write({ domain, area: area1, data })

        const arg = axios.post.mock.calls[0][1]
        const [, keys] = arg.split('\n')
        expect(base64ToJson(keys)).toEqual({
          [consentKeys.kid]: expect.any(String),
          [accountKey.kid]: expect.any(String)
        })
      })
      it('properly encrypts document', async () => {
        const data = { foo: 'bar' }
        await write({ domain, area: area1, data })

        const arg = axios.post.mock.calls[0][1]
        const [cipher, keys] = arg.split('\n')
        const consentDocumentKey = base64ToJson(keys)[consentKeys.kid]
        const aesKey = crypto.decryptDocumentKey(consentDocumentKey, consentKeys.privateKey)
        const doc = crypto.decryptDocument(aesKey, cipher)
        expect(doc).toEqual(data)
      })
    })
  })
})
