/* eslint-disable */
const { query, multiple, transaction } = require('./adapters/postgres')
const { verify } = require('./services/jwt')
const { createConnectionEvent, createLoginEvent } = require('./services/tokens')
const {
  checkConnection,
  connectionInserts,
  permissionsInserts,
  serviceInsert
} = require('./sqlStatements')
const axios = require('axios')
const { jwks: { getKeys } } = require('@egendata/messaging')

async function registerService({ header, payload }, res) {
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

async function loginResponse({ payload }, res, next) {
  try {
    const { iss } = payload
    const { payload: { aud } } = await verify(payload.payload)

    const [resAccount, resService, resConnection] = await multiple(checkConnection({
      accountId: iss,
      serviceId: aud
    }))

    if (!resAccount.rows.length) {
      throw new Error(`No such account ${iss}`)
    }
    if (!resService.rows.length) {
      throw new Error(`No such service ${aud}`)
    }
    if (!resConnection.rows.length) {
      throw new Error('No connection exists')
    }
    const loginEventToken = await createLoginEvent(aud, payload.payload)
    const url = resService.rows[0].events_uri
    await axios.post(url, loginEventToken, { headers: { 'content-type': 'application/jwt' } })

    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}

async function connectionResponse({ payload: connection_token }, res, next) {
  try {
    let connection
    try {
      const verified = await verify(connection_token.payload)
      connection = verified.payload
    } catch (error) {
      throw Error('Could not verify CONNECTION payload')
    }

    const [resAccount, resService, resConnection] = await multiple(checkConnection({
      accountId: connection_token.iss,
      serviceId: connection.aud
    })).catch(err => {
      throw new Error('Could not check connection', err)
    })

    if (!resAccount.rows.length) {
      throw new Error(`No such account ${connection_token.iss}`)
    }
    if (!resService.rows.length) {
      throw new Error(`No such service ${connection.aud}`)
    }
    if (resConnection.rows.length) {
      throw new Error('Connection already exists')
    }

    // Add connection to db
    const connectionSql = connectionInserts({
      connectionId: connection.sub,
      accountId: connection_token.iss,
      serviceId: connection.aud
    })

    let permissionsSql = []
    if (connection.permissions && connection.permissions.approved) {
      const readKeyIds = connection.permissions.approved
        .filter(p => p.type === 'READ')
        .map(p => p.kid)
      const keys = await getKeys(readKeyIds)
      permissionsSql = permissionsInserts(connection_token, connection, keys)
    }

    try {
      const statements = [...connectionSql, ...permissionsSql]
      await transaction(statements)
    } catch (error) {
      console.error('error', error)
      throw error
    }

    // Send connection event to service
    const connectionEventToken = await createConnectionEvent(connection.aud, connection_token.payload)
    const url = resService.rows[0].events_uri
    try {
      await axios.post(url, connectionEventToken, { headers: { 'content-type': 'application/jwt' } })
    } catch (error) {
      console.error((`Could not send token to ${url}`))
      throw Error(`Could not send token to ${url}`)
    }

    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerService,
  connectionResponse,
  loginResponse
}
