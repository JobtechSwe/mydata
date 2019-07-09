const { camelCase } = require('changecase-objects')
const { writePermission, readPermission } = require('./sqlStatements')
const { multiple } = require('./adapters/postgres')
const { get } = require('./adapters/pds')
const { createDataReadResponse } = require('./services/tokens')

async function read ({ payload }, res, next) {
  const connectionId = payload.sub
  const statements = payload.paths.map(({ domain, area }) => readPermission({
    connectionId,
    domain,
    area,
    serviceId: payload.iss
  }))
  const result = await multiple(statements)
  const reads = []
  for (let { rows } of result) {
    for (let row of rows) {
      const { pdsProvider, pdsCredentials, domain, area } = camelCase(row)
      const { readFile } = get({ pdsProvider, pdsCredentials })

      const path = `/data/${encodeURIComponent(connectionId)}/${encodeURIComponent(domain)}/${encodeURIComponent(area)}/data.json`
      reads.push(readFile(path, 'utf8')
        .then((data) => ({
          domain,
          area,
          data: data && JSON.parse(data)
        }))
        .catch((err) => {
          if (err.code === 'ENOENT') {
            return { domain, area }
          } else {
            return {
              domain,
              area,
              error: {
                message: err.message,
                status: err.status,
                code: err.code
              }
            }
          }
        })
      )
    }
  }
  const paths = await Promise.all(reads)

  const token = await createDataReadResponse(payload, paths)

  res.status(200).set('Content-Type', 'application/jwt').send(token)
}

function toDataMap (paths) {
  const map = {}
  for (let { domain, area, data } of paths) {
    if (!map[domain]) {
      map[domain] = {}
    }
    map[domain][area] = data
  }
  return map
}

async function write ({ payload }, res, next) {
  const connectionId = payload.sub
  const statements = payload.paths.map(({ domain, area }) => writePermission({
    connectionId,
    domain,
    area,
    serviceId: payload.iss
  }))
  const dataMap = toDataMap(payload.paths)
  const results = await multiple(statements)
  const writes = []
  for (let { rows } of results) {
    for (let row of rows) {
      const { pdsProvider, pdsCredentials, domain, area } = camelCase(row)
      const { outputFile } = get({ pdsProvider, pdsCredentials })

      const path = `/data/${encodeURIComponent(connectionId)}/${encodeURIComponent(domain)}/${encodeURIComponent(area)}/data.json`
      const data = dataMap[domain] && dataMap[domain][area]
      if (data) {
        writes.push(outputFile(path, JSON.stringify(data), 'utf8'))
      }
    }
  }
  await Promise.all(writes)

  res.sendStatus(200)
}

module.exports = {
  read,
  write
}
