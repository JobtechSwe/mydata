const moment = require('moment')
const redis = require('../adapters/redis')
const { transaction, query } = require('../adapters/postgres')
const { v4 } = require('uuid')
const axios = require('axios')
const { camelCase } = require('changecase-objects') // Caveat! This function converts Date to {}
const schemas = require('./schemas')
const { createToken } = require('./jwt')

async function createRequest (data, signature) {
  await schemas.consentRequest.validate(data, schemas.defaultOptions)

  let id, url, result, expires
  let tries = 0
  do {
    id = v4()
    url = `mydata://register/${id}`
    const redisData = JSON.stringify({ data, signature })
    const expireInSeconds = 3600
    result = await redis.set(`consentRequest:${id}`, redisData, 'NX', 'EX', expireInSeconds)
    expires = moment().add(expireInSeconds, 'seconds').format('X')

    if (tries++ > 10) {
      throw Error('max tries when setting consentRequest in redis')
    }
  } while (result !== 'OK')

  return {
    id,
    url,
    expires
  }
}

async function getRequest (id) {
  const reqStr = await redis.get(`consentRequest:${id}`)
  if (!reqStr) {
    return
  }
  const { data, signature } = JSON.parse(reqStr)
  const domains = [...new Set([data.clientId].concat(data.scope.map(s => s.domain)))]
  const params = domains.map((_, ix) => '$' + (ix + 1)).join(', ')
  const { rows } = await query(`
    SELECT
      client_id, display_name, description, jwks_url
    FROM
      clients
    WHERE client_id IN (${params})
  `, domains)
  const clients = rows.reduce((clients, row) => ({
    ...clients,
    [row.client_id]: {
      displayName: row.display_name,
      description: row.description,
      jwksUrl: row.jwks_url
    }
  }), {})
  return {
    data,
    signature: {
      alg: signature.alg,
      kid: signature.kid,
      data: signature.data
    },
    clients
  }
}

function columnIndices (columns) {
  return columns.split(', ').map((_, ix) => `$${ix + 1}`).join(', ')
}

function buildConsentRequestQuery ({
  consentId,
  consentRequestId,
  accountId,
  clientId,
  body
}) {
  const table = 'consent_requests'
  const columns = 'consent_request_id, consent_id, account_id, client_id, response'
  const sql = `INSERT INTO ${table}(${columns}) VALUES(${columnIndices(columns)})`
  const params = [
    consentRequestId,
    consentId,
    accountId,
    clientId,
    JSON.stringify(body)
  ]
  return [sql, params]
}

function buildScopeQueries (scopeEntries) {
  return scopeEntries.map(({ scopeId, consentId, domain, area, description, purpose, lawfulBasis, permissions }) => {
    const table = 'scope'
    const columns = 'scope_id, consent_id, domain, area, description, purpose, lawful_basis, read, write'
    const sql = `INSERT INTO ${table}(${columns}) VALUES(${columnIndices(columns)})`
    const params = [
      scopeId,
      consentId,
      domain,
      area,
      description,
      purpose,
      lawfulBasis,
      permissions.includes('READ'),
      permissions.includes('WRITE')
    ]
    return [sql, params]
  })
}

function buildEncryptionKeyQueries ({ consentEncryptionKeyId, consentEncryptionKey }) {
  const table = 'encryption_keys'
  const columns = 'key_id, encryption_key'
  const sql = `INSERT INTO ${table}(${columns}) VALUES(${columnIndices(columns)}) ON CONFLICT DO NOTHING`
  const params = [
    consentEncryptionKeyId, Buffer.from(consentEncryptionKey, 'base64').toString('utf8')
  ]
  return [[sql, params]]
}

function buildScopeEntryKeyQueries (consentEncryptionKeyId, scope) {
  return scope.map(({ scopeId }) => {
    const table = 'scope_keys'
    const columns = 'scope_id, encryption_key_id'
    const sql = `INSERT INTO ${table}(${columns}) VALUES(${columnIndices(columns)})`
    const params = [
      scopeId, consentEncryptionKeyId
    ]
    return [sql, params]
  })
}

async function create (body) {
  await schemas.consent.validate(body, schemas.defaultOptions)

  const {
    consentRequestId,
    consentEncryptionKeyId,
    consentEncryptionKey,
    accountId,
    accountKey,
    clientId,
    scope
  } = body
  const consentId = v4()
  const scopeEntries = scope.map(scopeEntry => ({
    ...scopeEntry,
    consentId,
    scopeId: v4()
  }))

  const consentRequestQuery = buildConsentRequestQuery({ consentId, consentRequestId, accountId, clientId, body })
  const scopeQueries = buildScopeQueries(scopeEntries)
  const encryptionKeyQueries = buildEncryptionKeyQueries({ consentEncryptionKeyId, consentEncryptionKey })
  const scopeEntryKeyQueries = buildScopeEntryKeyQueries(consentEncryptionKeyId, scopeEntries)
  const queries = [consentRequestQuery].concat(scopeQueries).concat(encryptionKeyQueries).concat(scopeEntryKeyQueries)
  await transaction(queries)

  const accessToken = createToken({ consentId })

  const eventBody = {
    type: 'CONSENT_APPROVED',
    payload: {
      consentRequestId,
      consentId,
      accessToken,
      scope: scope.map(s => ({
        ...s,
        accessKeyIds: [`mydata://${consentId}/account_key`, consentEncryptionKeyId]
      })),
      keys: {
        [`mydata://${consentId}/account_key`]: accountKey,
        [consentEncryptionKeyId]: consentEncryptionKey
      }
    }
  }

  try {
    await axios.post(`${clientId}/events`, eventBody) // TODO: Should be from clients.eventsUrl
  } catch (error) {
    throw new Error('could not post consent to client')
  }
}

async function list (consentId, domain, area) {
  let sql = `
    SELECT
      cr.account_id,
      a.pds_provider,
      a.pds_credentials,
      s.domain,
      s.area,
      s.read,
      s.write
    FROM
      consent_requests as cr
    INNER JOIN
      accounts as a on a.id = cr.account_id
    INNER JOIN
      scope as s on s.consent_id = cr.consent_id
    WHERE cr.consent_id = $1`
  const params = [consentId]

  if (domain) {
    sql += ' AND s.domain = $2'
    params.push(domain)

    if (area) {
      sql += ' AND s.area = $3'
      params.push(area)
    }
  }

  const result = await query(sql, params)

  return result.rows.map(row => {
    row.pds_credentials = JSON.parse(row.pds_credentials.toString('utf8'))
    return camelCase(row)
  })
}

async function get (accountId, clientId) {
  // Only get from db and not redis since we only want approved consents
  const sql = `
  SELECT
    consent_requests.consent_id,
    consent_requests.client_id,
    consent_requests.processed,
    clients.display_name,
    clients.description,
    clients.client_key
  FROM
    consent_requests
  JOIN CLIENTS ON
    clients.client_id = consent_requests.client_id
   WHERE
    consent_requests.account_id = $1
  AND
    consent_requests.client_id = $2`
  const params = [accountId, clientId]

  let result = await query(sql, params)
  return result.rows.map(row => ({
    consentId: row.consent_id,
    clientId: row.client_id,
    processedAt: row.processed,
    clientDisplayName: row.display_name,
    clientDescription: row.description,
    clientKey: row.client_key
  }))
}

const getAll = async accountId => {
  if (!accountId) { throw Error('AccountId is missing') }

  const sql = `
  SELECT
    consent_requests.consent_id,
    clients.client_id,
    clients.display_name as client_display_name,
    clients.description as client_description
  FROM consent_requests
    INNER JOIN clients ON
      clients.client_id = consent_requests.client_id
  WHERE consent_requests.account_id = $1`

  const { rows } = await query(sql, [ accountId ])

  return rows.map(camelCase)
}

module.exports = {
  createRequest,
  getRequest,
  create,
  list,
  get,
  getAll
}
