/* eslint-disable */
const createError = require('http-errors')
const { query, multiple } = require('./adapters/postgres')
const { verify } = require('./services/jwt')
const { createConnectionEvent, createLoginEvent } = require('./services/tokens')
const {
  accountKeyInsert,
  checkConnection,
  connectionInsert,
  permissionInsert,
  serviceInsert
} = require('./sqlStatements')
const axios = require('axios')

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

async function loginResponse ({ header, payload }, res, next) {
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

async function connectionResponse ({ header, payload }, res, next) {
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
      console.error('Could not check connection', err)
      throw err
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
    const connectionEventToken = await createConnectionEvent(aud, payload.payload)
    const url = resService.rows[0].events_uri

    try {
      await axios.post(url, connectionEventToken, { headers: { 'content-type': 'application/jwt' } })
    } catch (error) {
      console.error((`Could not send token to ${url}`))
      throw Error(`Could not send token to ${url}`)
    }

    // Add connection to db
    const connectionSql = connectionInsert({
      connectionId: sub,
      accountId: iss,
      serviceId: aud
    })
    const permissionsSql = approved(permissions)
    await query(...connectionSql)
    res.sendStatus(201)
  } catch (error) {
    console.error('Could not handle connectionResponse', error)
    next(error)
  }
}

function approved ({ approved } = {}) {
  return []
}

module.exports = {
  registerService,
  connectionResponse,
  loginResponse
}
