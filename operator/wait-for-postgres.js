const postgres = require('./lib/adapters/postgres')

postgres.query('SELECT NOW()')
  .then(r => {
    process.exit(0)
  })
  .catch(e => {
    process.exit(1)
  })
