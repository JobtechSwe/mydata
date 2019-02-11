const { create, get } = require('../../lib/services/clients')
const pg = require('../../__mocks__/pg')

describe('services/clients', () => {
  describe('#create', () => {
    let data
    beforeEach(() => {
      data = {
        clientId: 'http://mycv.example',
        displayName: 'mycv',
        description: 'this is the best app there is',
        jwksUrl: '/jwks',
        eventsUrl: '/events',
        clientKey: 'my-public-key'
      }
      pg.client.query.mockResolvedValue({
        rowCount: 1
      })
    })
    it('calls query with correct parameters', async () => {
      await create(data)
      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String), [
        data.clientId,
        data.displayName,
        data.description,
        data.jwksUrl,
        data.eventsUrl,
        data.clientKey
      ])
    })
    it('throws if number of rows affected is not 1', async () => {
      pg.client.query.mockResolvedValue({ rowCount: 5 })
      await expect(create(data)).rejects.toThrow()
    })
    it('returns the client camelCased', async () => {
      const result = await create(data)
      expect(result).toEqual(data)
    })
  })
  describe('#get', () => {
    beforeEach(() => {
      pg.client.query.mockResolvedValue({
        rows: [{
          client_id: 'http://mycv.example',
          display_name: 'mycv',
          description: 'this is the best app there is',
          jwks_url: '/jwks',
          events_url: 'events',
          client_key: 'my-public-key'
        }]
      })
    })
    it('returns the data camelCased', async () => {
      const result = await get('mycv.example')
      expect(result).toEqual({
        clientId: 'http://mycv.example',
        displayName: 'mycv',
        description: 'this is the best app there is',
        jwksUrl: '/jwks',
        eventsUrl: 'events',
        clientKey: 'my-public-key'
      })
    })
  })
})
