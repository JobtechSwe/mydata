const pg = require('../../../__mocks__/pg')
const dfs = require('../../../__mocks__/dropbox-fs')()
const { createApi } = require('../../helpers')

const app = require('../../../lib/app')
const jwt = require('../../../lib/services/jwt')

describe('routes /api/data', () => {
  let api, dbRows, authHeader, consentId
  beforeEach(() => {
    // JWT
    process.env.JWT_SECRET = 'some secret'
    consentId = '53360f91-6de2-47f2-98b6-b3f6aa333dd0'
    const accessToken = jwt.createToken({ consentId })
    authHeader = { 'Authorization': `Bearer ${accessToken}` }

    // DB
    const credentialsBuffer = Buffer.from(JSON.stringify({ apiKey: 'key' }))
    dbRows = [
      {
        account_id: 'b106b599-d821-48cb-b588-e583d6dc41e8',
        pds_provider: 'dropbox',
        pds_credentials: credentialsBuffer,
        domain: 'localhost:4000',
        area: 'cv',
        read: true,
        write: true
      },
      {
        account_id: 'b106b599-d821-48cb-b588-e583d6dc41e8',
        pds_provider: 'dropbox',
        pds_credentials: credentialsBuffer,
        domain: 'localhost:4000',
        area: 'personal',
        read: true,
        write: true
      },
      {
        account_id: 'b106b599-d821-48cb-b588-e583d6dc41e8',
        pds_provider: 'dropbox',
        pds_credentials: credentialsBuffer,
        domain: 'linkedin.com',
        area: 'experience',
        read: true,
        write: true
      }
    ]
    pg.client.query.mockImplementation((_, [, domain, area]) => {
      let rows = dbRows
      if (domain) {
        rows = rows.filter(r => r.domain === domain)
        if (area) {
          rows = rows.filter(r => r.area === area)
        }
      }
      return { rows }
    })

    // PDS
    dfs.filesystem = {
      'data': {
        [encodeURIComponent('localhost:4000')]: {
          'cv.mydata.txt': '{"cv":"foo"}',
          'personal.mydata.txt': '{"name":"Johan"}'
        },
        [encodeURIComponent('linkedin.com')]: {
          'experience.mydata.txt': '{"experience":1}'
        }
      }
    }

    // API
    api = createApi(app)
  })
  describe('GET', () => {
    it('reads all data for the correct account', async () => {
      const url = '/api/data'
      const response = await api.get(url, authHeader)

      // Gets consent info from db
      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String), [consentId])

      const expected = {
        'localhost:4000': {
          'cv': '{"cv":"foo"}',
          'personal': '{"name":"Johan"}'
        },
        'linkedin.com': {
          'experience': '{"experience":1}'
        }
      }
      expect(response.body).toEqual({ data: expected })
    })
    it('reads all data for the correct account and domain', async () => {
      const domain = 'localhost:4000'
      const url = `/api/data/${encodeURIComponent(domain)}`
      const response = await api.get(url, authHeader)

      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String),
        [consentId, domain]
      )

      const expected = {
        'localhost:4000': {
          'cv': '{"cv":"foo"}',
          'personal': '{"name":"Johan"}'
        }
      }
      expect(response.body).toEqual({ data: expected })
    })
    it('reads all data for the correct account, domain and area', async () => {
      const domain = 'localhost:4000'
      const area = 'personal'
      const url = `/api/data/${encodeURIComponent(domain)}/${encodeURIComponent(area)}`
      const response = await api.get(url, authHeader)

      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String),
        [consentId, domain, area]
      )

      const expected = {
        'localhost:4000': {
          'personal': '{"name":"Johan"}'
        }
      }
      expect(response.body).toEqual({ data: expected })
    })
  })
})
