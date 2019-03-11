const moment = require('moment')
const redis = require('../adapters/redis')
const { transaction, query } = require('../adapters/postgres')
const { v4 } = require('uuid')
const axios = require('axios')
const { camelCase } = require('changecase-objects')
const schemas = require('./schemas')
const { createToken } = require('./jwt')

async function createRequest (data, signature) {
  await schemas.consentRequest().validate(data, schemas.defaultOptions)

  let id, link, result, expires
  let tries = 0
  do {
    id = v4()
    link = `mydata://register/${id}`
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
    link,
    expires
  }
}

async function getRequest (id) {
  const reqStr = await redis.get(`consentRequest:${id}`)
  if (!reqStr) {
    return
  }
  const { data, signature } = JSON.parse(reqStr)
  return {
    data,
    signature: {
      alg: signature.alg,
      kid: signature.kid,
      data: signature.data
    },
    client: {
      jwksUrl: signature.client.jwksUrl,
      displayName: signature.client.displayName,
      description: signature.client.description
    }
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
  await schemas.consent().validate(body, schemas.defaultOptions)

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

async function get (id) {
  const result = await query('SELECT * FROM consents WHERE id=$1', [id])

  if (!result || !result.rows || !result.rows.length) {
    throw new Error('No consent found')
  }

  return camelCase(result.rows[0])
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

  console.log(sql)
  console.log(params)

  const result = await query(sql, params)

  console.log(result)

  return result.rows.map(row => {
    row.pds_credentials = JSON.parse(row.pds_credentials.toString('utf8'))
    return camelCase(row)
  })
}

module.exports = {
  createRequest,
  getRequest,
  create,
  get,
  list
}
