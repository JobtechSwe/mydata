const { Client } = require('pg')
const config = {
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || '5432',
  user: process.env.PGUSER || 'postgresuser',
  password: process.env.PGPASSWORD || 'postgrespassword',
  database: process.env.PGDATABASE || 'mydata'
}

console.log('=)=)=)=)=)=))=')
console.log('Hej från postgres adapter!')
console.log('=)=)=)=)=)=))=')

const wait = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms))

async function connect (attemptNo = 0) {
  console.log('=)=)=)=)=)=))=')
  console.log('CONNECT i postgres adapter!')
  console.log('=)=)=)=)=)=))=')
  try {
    const client = new Client(config)
    await client.connect()
    return client
  } catch (err) {
    console.warn(err)
    const delay = Math.min(1000 * attemptNo, 7000)
    console.log('=)=)=)=)=)=))=')
    console.log('WAIT i postgres adapter!')
    console.log('=)=)=)=)=)=))=')
    await wait(delay)
    return connect(++attemptNo)
  }
}

async function query (sql, params = []) {
  const conn = await connect()
  try {
    const result = await conn.query(sql, params)
    return result
  } finally {
    await conn.end()
  }
}

async function transaction (queries) {
  const conn = await connect()
  try {
    await conn.query('BEGIN')
    const results = []
    for (const args of queries) {
      let result = await conn.query(...args)
      results.push(result)
    }
    await conn.query('COMMIT')
    return results
  } catch (error) {
    await conn.query('ROLLBACK')
    throw error
  } finally {
    await conn.end()
  }
}

module.exports = { query, transaction }
