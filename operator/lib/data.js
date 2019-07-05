const { camelCase } = require('changecase-objects')
const { writePermission, readPermission } = require('./sqlStatements')
const { query } = require('./adapters/postgres')
const { get } = require('./adapters/pds')
const { createDataReadResponse } = require('./services/tokens')

async function read ({ payload }, res, next) {
  const connectionId = payload.sub
  const [sql, params] = readPermission({
    connectionId,
    domain: payload.domain,
    area: payload.area,
    serviceId: payload.iss
  })
  const { rows } = await query(sql, params)
  const { pdsProvider, pdsCredentials, domain, area } = camelCase(rows[0])
  const { readFile } = get({ pdsProvider, pdsCredentials })

  const path = `/data/${encodeURIComponent(connectionId)}/${encodeURIComponent(domain)}/${encodeURIComponent(area)}/data.json`
  const file = await readFile(path, 'utf8')

  const token = await createDataReadResponse(payload, file && JSON.parse(file))

  res.status(200).set('Content-Type', 'application/jwt').send(token)
}

async function write ({ payload }, res, next) {
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
  await outputFile(path, JSON.stringify(payload.data), 'utf8')

  res.sendStatus(200)
}

module.exports = {
  read,
  write
}
