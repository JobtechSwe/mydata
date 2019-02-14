const dataService = require('../lib/data')
const axios = require('axios')
const { sign } = require('jsonwebtoken')
const KeyProvider = require('../lib/keyProvider')
const MemoryKeyValueStore = require('../lib/memoryKeyValueStore')
jest.mock('axios')

describe('data', () => {
  let config, consentId, accessToken, keyProvider

  beforeEach(() => {
    const keyValueStore = new MemoryKeyValueStore()
    keyProvider = new KeyProvider({
      clientKeys: {},
      keyOptions: {},
      jwksUrl: 'http://localhost:4000/jwks',
      keyValueStore
    })
    config = { operator: 'http://localhost:3000' }
    consentId = '528adc99-e899-422f-a0f2-a95d3a066464'
    accessToken = sign({ data: { consentId } }, 'secret')
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

    it('calls axios.post with correct url, data and header', async () => {
      const data = { foo: 'bar' }
      await write({ domain: 'cv.work:4000', area: 'cv', data })

      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:3000/api/data/${encodeURIComponent('cv.work:4000')}/${encodeURIComponent('cv')}`,
        { foo: 'bar' },
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
    })
  })
})
