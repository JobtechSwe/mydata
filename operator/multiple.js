const { query } = require('./lib/adapters/postgres')

async function run () {
  const [resAccount, resService, resConnection] = await query(`
    SELECT account_key FROM accounts WHERE account_id = $1;
    SELECT service_key FROM services WHERE service_id = $2;
    SELECT * FROM connections WHERE account_id = $1 AND service_id = $2;
  `, ['foo', 'bar'])

  console.log(resAccount)
  console.log(resService)
  console.log(resConnection)
}

run()
