/* eslint-disable */
const { query, multiple } = require('./adapters/postgres')
const { verify } = require('./services/jwt')
const { createConnectionEvent } = require('./services/tokens')
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

async function loginResponse ({ header, payload, token }) {
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

async function connectionResponse ({ header, payload }, res, next) {
  try {
    const { iss } = payload
    const { payload: { aud, sub } } = await verify(payload.payload)

    const [resAccount, resService, resConnection] = await multiple(checkConnection({
      accountId: iss,
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
    const connectionEventToken = await createConnectionEvent(aud, payload.payload)
    const url = resService.rows[0].events_uri

    axios.post(url, connectionEventToken, { headers })

    // Add connection to db
    const connectionSql = connectionInsert({
      connectionId: sub,
      accountId: iss,
      serviceId: aud
    })
    await query(...connectionSql)

    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
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
  connectionResponse,
  loginResponse
}
