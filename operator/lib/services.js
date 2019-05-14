const { query, multiple } = require('./adapters/postgres')
const jwt = require('./services/jwt')
const axios = require('axios')

const headers = {
  'Content-Type': 'application/jwt'
}

async function registerService ({ header, payload }) {
  await query(`INSERT INTO services(
    service_id,
    service_key,
    display_name,
    description,
    icon_uri,
    jwks_uri,
    events_uri
  ) VALUES($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT ON CONSTRAINT service_id DO
  UPDATE SET
    service_key = $2,
    display_name = $3,
    description = $4,
    icon_uri = $5,
    jwks_uri = $6,
    events_uri = $7
  WHERE service_id = $1`, [
    payload.iss,
    JSON.stringify(header.jwk),
    payload.displayName,
    payload.description,
    payload.iconURI,
    payload.jwksURI,
    payload.eventsURI
  ])
}

async function accountLogin ({ payload, token }) {
  const { iss, aud: [, aud] } = payload
  const [resAccount, resService, resConnection] = await multiple([
    ['SELECT account_key FROM accounts WHERE account_id = $1', [iss]],
    ['SELECT events_uri FROM services WHERE service_id = $1', [aud]],
    ['SELECT * FROM connections WHERE account_id = $1 AND service_id = $2', [iss, aud]]
  ])

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

async function accountConnection ({ header, payload }) {

}

module.exports = {
  registerService,
  accountConnection,
  accountLogin
}
