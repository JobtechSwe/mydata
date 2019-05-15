const { query, multiple, transaction } = require('./adapters/postgres')
const jwt = require('./services/jwt')
const {
  accountKeyInsert,
  checkConnection,
  connectionInsert,
  permissionInsert,
  serviceInsert
} = require('./sqlStatements')
const axios = require('axios')

const headers = {
  'Content-Type': 'application/jwt'
}

async function registerService ({ header, payload }, res) {
  const params = {
    serviceId: payload.iss,
    serviceKey: JSON.stringify(header.jwk),
    displayName: payload.displayName,
    description: payload.description,
    iconURI: payload.iconURI,
    jwksURI: payload.jwksURI,
    eventsURI: payload.eventsURI
  }
  await query(...serviceInsert(params))

  res.sendStatus(200)
}

async function accountLogin ({ header, payload, token }) {
  const { jwk: { kid } } = header
  const { aud: [, aud] } = payload
  const params = {
    accountId: kid,
    serviceId: aud
  }
  const [resAccount, resService, resConnection] = await multiple(checkConnection(params))

  if (!resAccount.rows.length) {
    throw new Error('No such account')
  }
  if (!resService.rows.length) {
    throw new Error('No such service')
  }
  if (!resConnection.rows.length) {
    throw new Error('No connection exists')
  }
  const loginEventToken = await jwt.loginEventToken(aud, token)
  const url = resService.rows[0].events_uri
  return axios.post(url, loginEventToken, { headers })
}

async function accountConnect ({ header, payload, token }) {
  const { jwk: { kid } } = header
  const { aud: [, aud], sub } = payload

  const [resAccount, resService, resConnection] = await multiple(checkConnection({
    accountId: kid,
    serviceId: aud
  }))

  if (!resAccount.rows.length) {
    throw new Error('No such account')
  }
  if (!resService.rows.length) {
    throw new Error('No such service')
  }
  if (resConnection.rows.length) {
    throw new Error('Connection already exists')
  }
  const connectionEventToken = await jwt.connectionEventToken(aud, token)
  const url = resService.rows[0].events_uri

  const response = axios.post(url, connectionEventToken, { headers })

  // Add connection to db
  const connection = connectionInsert({
    connectionId: sub,
    accountId: kid,
    serviceId: aud
  })

  const local = permissions(payload, payload.permissions.local || {}, payload.aud[1])
  await transaction([connection].concat(local))
  return response
}

function permissions (payload, block, domain) {
  return Object.entries(block)
    .reduce((statements, [area, permissions]) => {

      // Add account key to db
      const params = {
        accountKeyId: '',
        accountId: '',
        domain,
        area,
        readKey: ''
      }
      statements.push(accountKeyInsert(params))

      Object.entries(permissions)
        .forEach(([type, permission]) => {
          const params = {
            permissionId: permission.id,
            connectionId: payload.sub,
            domain,
            area,
            type,
            purpose: permission.purpose,
            legalBasis: permission.legalBasis,
            readKey: null
          }

          if (type.toUpperCase() === 'READ') {
            const key = permission.jwks.find(jwk => jwk.kid.match(new RegExp(`^${domain}`)))
            params.readKey = key
          }
          statements.push(permissionInsert(params))
        })
      return statements
    }, [])
}

module.exports = {
  registerService,
  accountConnect,
  accountLogin
}
