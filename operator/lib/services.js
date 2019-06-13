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

async function loginResponse({ header, payload }, res, next) {
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
  if (!resConnection.rows.length) {
    throw new Error('No connection exists')
  }
  const loginEventToken = await createLoginEvent(payload.payload, aud)
  const url = resService.rows[0].events_uri
  await axios.post(url, loginEventToken, { headers: { 'content-type': 'application/jwt' } })

  res.sendStatus(200)
}

async function connectionResponse({ payload }, res, next) {
  try {
    const { iss } = payload
    let verified
    try {
      verified = await verify(payload.payload)
    } catch (error) {
      throw Error('Could not verify CONNECTION_RESPONSE payload')
    }

    const { payload: { aud, sub, permissions } } = verified

    const [resAccount, resService, resConnection] = await multiple(checkConnection({
      accountId: iss,
      serviceId: aud
    })).catch(err => {
      throw new Error('Could not check connection', err)
    })

    if (!resAccount.rows.length) {
      throw new Error(`No such account ${iss}`)
    }
    if (!resService.rows.length) {
      throw new Error(`No such service ${aud}`)
    }
    if (resConnection.rows.length) {
      throw new Error('Connection already exists')
    }

    // Add connection to db
    const connectionSql = connectionInserts({
      connectionId: sub,
      accountId: iss,
      serviceId: aud
    })
    let permissionsSql = []
    if (permissions && permissions.approved) {
      const readKeyIds = permissions.approved
        .filter(p => p.type === 'READ')
        .map(p => p.kid)
      const keys = await getKeys(readKeyIds)
      permissionsSql = permissionsInserts(payload, { sub, permissions }, keys)
    }
    await transaction([...connectionSql, ...permissionsSql])

    // Send connection event to service
    const connectionEventToken = await createConnectionEvent(aud, payload.payload)
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
