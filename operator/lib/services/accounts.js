const { query } = require('../adapters/postgres')
const { sendEventLoginApproved } = require('../services/clients')
const { createToken } = require('./jwt')
const { v4 } = require('uuid')
const { camelCase } = require('changecase-objects')
const schemas = require('./schemas')

async function create (account) {
  await schemas.createAccount.validate(account, schemas.defaultOptions)

  const { accountKey, pds } = account

  const id = v4()
  const credentials = Buffer.from(JSON.stringify({ apiKey: pds.access_token }))
  await query('INSERT INTO accounts(id, account_key, pds_provider, pds_credentials) VALUES($1, $2, $3, $4)', [
    id,
    Buffer.from(accountKey, 'base64').toString('utf8'),
    pds.provider,
    credentials
  ])
  return { id }
}

async function get (accountId) {
  await schemas.accountId.validate(accountId)
  const result = await query('SELECT id, account_key, pds_provider, pds_credentials FROM accounts WHERE id=$1', [accountId])
  if (!result.rows.length) {
    return
  }
  if (result.rows[0].pds_credentials) {
    result.rows[0].pds_credentials = JSON.parse(result.rows[0].pds_credentials.toString('utf8'))
  }
  const account = camelCase(result.rows[0])
  return account
}

async function login (accountId, data) {
  await schemas.accountId.validate(accountId, schemas.defaultOptions)
  await schemas.login.validate(data, schemas.defaultOptions)

  const result = await query('SELECT COUNT(*) FROM consent_requests WHERE account_id=$1 AND consent_id=$2', [accountId, data.consentId])
  if (result.rows[0].count === '0') {
    throw new Error('Login denied. Consent does not belong to user')
  }

  const accessToken = createToken({ consentId: data.consentId })
  sendEventLoginApproved(data, accessToken)
}

module.exports = {
  create,
  get,
  login
}
