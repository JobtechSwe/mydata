const { query } = require('../adapters/postgres')
const { camelCase } = require('changecase-objects')
const { post } = require('axios')

async function create ({ clientId, displayName, description, eventsUrl, jwksUrl, clientKey }) {
  const result = await query(`
    INSERT INTO clients(
      client_id,
      display_name,
      description,
      jwks_url,
      events_url,
      client_key)
    VALUES($1, $2, $3, $4, $5, $6)
    ON CONFLICT (client_id)
    DO
      UPDATE SET
        display_name = $2,
        description = $3,
        jwks_url = $4,
        events_url = $5,
        client_key = $6

  `, [clientId, displayName, description, jwksUrl, eventsUrl, clientKey])

  if (result.rowCount !== 1) {
    throw Error('Incorrect numbers of rows updated')
  }

  return camelCase({ clientId, displayName, description, eventsUrl, jwksUrl, clientKey })
}

async function get (clientId) {
  const result = await query(`
    SELECT * FROM clients
    WHERE client_id = $1
  `, [clientId])

  return camelCase(result.rows[0])
}

async function sendEventLoginApproved (payload, accessToken) {
  const result = await query(`
    SELECT events_url FROM clients
    WHERE client_id = $1
  `, [payload.clientId])
  const eventsUrl = result.rows[0].events_url

  const loginEvent = {
    type: 'LOGIN_APPROVED',
    accessToken,
    payload
  }
  post(eventsUrl, loginEvent)
}

module.exports = {
  create,
  get,
  sendEventLoginApproved
}
