const { writePermission } = require('./sqlStatements')
const { query } = require('./adapters/postgres')

async function read ({ header, payload }) {

}

async function write ({ header, payload }, res, next) {
  console.log('WRITE')
  const [sql, params] = writePermission({
    connectionId: payload.sub,
    domain: payload.domain,
    area: payload.area,
    serviceId: payload.iss
  })
  console.log(sql, params)
  const result = await query(sql, params)
  console.log(result)
  console.log('--------')
  res.sendStatus(200)
}

module.exports = {
  read,
  write
}
