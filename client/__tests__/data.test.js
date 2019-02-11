const dataService = require('../lib/data')
const axios = require('axios')
jest.mock('axios')

describe('data', () => {
  let config, accessToken

  describe('#read', () => {
    let read
    beforeEach(() => {
      axios.get = jest.fn()
      config = { operator: 'http://localhost:3000' }
      accessToken = 'asuidiuasduaisd'

      read = dataService({ config })
        .auth(accessToken)
        .read
    })

    it('calls axios.get with correct url and header for root', async () => {
      axios.get.mockResolvedValue({ data: { foo: 'bar' } })
      await read({})

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/data/`,
        { headers: { 'Authorization': 'Bearer asuidiuasduaisd' } })
    })

    it('calls axios.get with correct url and header for domain', async () => {
      axios.get.mockResolvedValue({ data: { foo: 'bar' } })
      await read({ domain: 'cv.work:4000' })

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/data/${encodeURIComponent('cv.work:4000')}`,
        { headers: { 'Authorization': 'Bearer asuidiuasduaisd' } })
    })

    it('calls axios.get with correct url and header for domain and area', async () => {
      axios.get.mockResolvedValue({ data: { foo: 'bar' } })
      await read({ domain: 'cv.work:4000', area: 'cv' })

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/data/${encodeURIComponent('cv.work:4000')}/${encodeURIComponent('cv')}`,
        { headers: { 'Authorization': 'Bearer asuidiuasduaisd' } })
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
      config = { operator: 'http://localhost:3000' }
      accessToken = 'lkfdgf'
      write = dataService({ config })
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
        { headers: { 'Authorization': 'Bearer lkfdgf' } }
      )
    })
  })
})
