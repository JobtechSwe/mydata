const dataService = require('../../lib/services/data')
const pg = require('../../__mocks__/pg')
const dfs = require('../../__mocks__/dropbox-fs')()

describe.skip('services/data', () => {
  let apiKey, consentId
  beforeEach(() => {
    apiKey = 'my key'
    consentId = 'some guid'
    dfs.filesystem = {
      'b106b599-d821-48cb-b588-e583d6dc41e8': {
        'data': {
          [encodeURIComponent('http://localhost:4000')]: {
            'cv.mydata.txt': '{"cv":"foo"}',
            'personal.mydata.txt': '{"name":"Johan"}'
          },
          [encodeURIComponent('https://linkedin.com')]: {
            'experience.mydata.txt': '{"experience":1}'
          }
        }
      }
    }
    const credentials = { apiKey }
    const credentialsBuffer = Buffer.from(JSON.stringify(credentials))
    pg.client.query.mockResolvedValue({
      rows: [
        {
          account_id: 'b106b599-d821-48cb-b588-e583d6dc41e8',
          pds_provider: 'dropbox',
          pds_credentials: credentialsBuffer,
          domain: 'http://localhost:4000',
          area: 'cv',
          read: true,
          write: true
        },
        {
          account_id: 'b106b599-d821-48cb-b588-e583d6dc41e8',
          pds_provider: 'dropbox',
          pds_credentials: credentialsBuffer,
          domain: 'http://localhost:4000',
          area: 'personal',
          read: true,
          write: true
        },
        {
          account_id: 'b106b599-d821-48cb-b588-e583d6dc41e8',
          pds_provider: 'dropbox',
          pds_credentials: credentialsBuffer,
          domain: 'https://linkedin.com',
          area: 'experience',
          read: true,
          write: true
        }
      ]
    })
  })
  afterEach(() => {
    pg.clearMocks()
  })
  describe('#read', () => {
    it('retrieves consent information from db', async () => {
      await dataService.read(consentId, 'localhost', 'cv')
      expect(pg.client.query).toHaveBeenCalledTimes(1)
    })
    it('filters on consentId', async () => {
      await dataService.read(consentId)
      expect(pg.client.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT([\s\S]*)WHERE([\s\S]*)consent_id = \$1/gm),
        [consentId]
      )
    })
    it('filters on consentId and domain', async () => {
      await dataService.read(consentId, 'localhost')
      expect(pg.client.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT([\s\S]*)WHERE([\s\S]*)consent_id = \$1([\s\S]*)AND([\s\S]*)domain = \$2/gm),
        [consentId, 'localhost']
      )
    })
    it('filters on consentId, domain and area', async () => {
      await dataService.read(consentId, 'localhost', 'cv')
      expect(pg.client.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT([\s\S]*)WHERE([\s\S]*)consent_id = \$1([\s\S]*)AND([\s\S]*)domain = \$2([\s\S]*)AND([\s\S]*)area = \$3/gm),
        [consentId, 'localhost', 'cv']
      )
    })
    it('reads and returns data for all consents', async () => {
      const expected = {
        'http://localhost:4000': {
          'cv': '{"cv":"foo"}',
          'personal': '{"name":"Johan"}'
        },
        'https://linkedin.com': {
          'experience': '{"experience":1}'
        }
      }
      const result = await dataService.read(consentId)
      expect(result).toEqual(expected)
    })
    it('returns null for missing data', async () => {
      dfs.filesystem['b106b599-d821-48cb-b588-e583d6dc41e8'].data[encodeURIComponent('http://localhost:4000')] = undefined
      const expected = {
        'http://localhost:4000': {
          'cv': null,
          'personal': null
        },
        'https://linkedin.com': {
          'experience': '{"experience":1}'
        }
      }
      const result = await dataService.read(consentId)
      expect(result).toEqual(expected)
    })
  })
  it('throws error `no consents`', () => {
    pg.client.query.mockResolvedValue({
      rows: []
    })

    expect(dataService.read(consentId)).rejects.toThrow('Found no consents for the provided arguments')
  })

  describe('#write', () => {
    it('retrieves consent information from db', async () => {
      await dataService.write('b106b599-d821-48cb-b588-e583d6dc41e8', 'localhost', 'cv')
      expect(pg.client.query).toHaveBeenCalledTimes(1)
    })
    it('filters on consentId, domain and area', async () => {
      await dataService.write('b106b599-d821-48cb-b588-e583d6dc41e8', 'localhost', 'cv')
      expect(pg.client.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT([\s\S]*)WHERE([\s\S]*)consent_id = \$1([\s\S]*)AND([\s\S]*)domain = \$2([\s\S]*)AND([\s\S]*)area = \$3/gm),
        ['b106b599-d821-48cb-b588-e583d6dc41e8', 'localhost', 'cv']
      )
    })
  })
})
