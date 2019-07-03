const runner = require('node-pg-migrate')
const { Client } = require('pg')
const path = require('path')

const connectionString = `postgres://postgresuser:postgrespassword@localhost:${process.env.OPERATOR_PGPORT}`
const dir = path.resolve(__dirname, '../../../operator/migrations')

const getClient = (schema) => new Client(`${connectionString}/${schema}`)

const createOperatorDb = async () => {
  try {
    const client = getClient('postgres')

    await client.connect()
    await client.query('DROP DATABASE mydata')
    await client.query('CREATE DATABASE mydata')
    await client.end()

    await runner({
      dir,
      direction: 'up',
      databaseUrl: `${connectionString}/mydata`,
      migrationsTable: 'pgmigrations',
      log: () => undefined
    })
  } catch (e) {
    console.error('Error creating Operator DB! \nMake sure to close any other open connections to it.', e)
  }
}

const dropOperatorDb = async () => {
  try {
    const client = getClient('postgres')

    await client.connect()
    await client.query('DROP DATABASE mydata')
  } catch (e) {
    console.error('Error dropping Operator DB! \nMake sure to close any other open connections to it.', e)
  }
}

const clearOperatorDb = async () => {
  try {
    const client = getClient('mydata')

    await client.connect()
    await Promise.all([
      client.query('DELETE FROM account_keys'),
      client.query('DELETE FROM permissions'),
      client.query('DELETE FROM connections'),
      client.query('DELETE FROM services'),
      client.query('DELETE FROM accounts')
    ])
    await client.end()
  } catch (e) {
    console.error('Error clearing Operator DB!', e)
  }
}

const queryOperatorDb = async (sql, params = []) => {
  const client = new Client(`${connectionString}/mydata`)
  await client.connect()
  try {
    const result = await client.query(sql, params)
    return result
  } finally {
    await client.end()
  }
}

module.exports = {
  createOperatorDb,
  dropOperatorDb,
  clearOperatorDb,
  queryOperatorDb
}
