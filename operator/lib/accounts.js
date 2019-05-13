const { query } = require('./adapters/postgres')

async function registerAccount ({ header, payload }) {
  await query('INSERT INTO accounts(account_id, account_key, pds_provider, pds_credentials) VALUES($1, $2, $3, $4)', [
    payload.iss,
    JSON.stringify(header.jwk),
    payload.pds.provider,
    Buffer.from(payload.pds.access_token)
  ])
}

async function getConnections () {

}

module.exports = {
  getConnections,
  registerAccount
}
