const { camelCase } = require('changecase-objects')
const { writePermission } = require('./sqlStatements')
const { query } = require('./adapters/postgres')
const { get } = require('./adapters/pds')

async function read ({ header, payload }) {

}

async function write ({ header, payload }, res, next) {
  const connectionId = payload.sub
  const [sql, params] = writePermission({
    connectionId,
    domain: payload.domain,
    area: payload.area,
    serviceId: payload.iss
  })
  const { rows } = await query(sql, params)
  const { pdsProvider, pdsCredentials, domain, area } = camelCase(rows[0])
  const { outputFile } = get({ pdsProvider, pdsCredentials })

  const path = `/data/${encodeURIComponent(connectionId)}/${encodeURIComponent(domain)}/${encodeURIComponent(area)}/data.json`
  await outputFile(path, payload.data, 'utf8')

  res.sendStatus(200)
}

module.exports = {
  read,
  write
}
