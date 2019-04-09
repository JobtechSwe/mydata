const runner = require('node-pg-migrate')
const { Client } = require('pg')
const path = require('path')

const connectionString = `postgres://postgresuser:postgrespassword@localhost:${process.env.OPERATOR_PGPORT}`
const dir = path.resolve(__dirname, '../../../operator/migrations')

const clearOperatorDb = async () => {
  const client = new Client(`${connectionString}/postgres`)

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
}

module.exports = {
  clearOperatorDb
}
