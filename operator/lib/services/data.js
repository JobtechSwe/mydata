const { list } = require('./consents')
const pds = require('../adapters/pds')
const merge = require('merge')

const EXT = '.mydata.txt'

const read = async (consentId, domain, area) => {
  const consents = await list(consentId, domain, area)
  console.log(consents)
  if (consents.length === 0) {
    throw Error('Found no consents for the provided arguments')
  }
  const content = await Promise.all(
    consents.map(async ({
      accountId,
      pdsProvider,
      pdsCredentials,
      domain,
      area
    }) => {
      const path = `/${accountId}/data/${encodeURIComponent(domain)}/${encodeURIComponent(area)}${EXT}`
      const content = await pds
        .get({ pdsProvider, pdsCredentials })
        .readFile(path, 'utf8')
        .catch(_ => {
          // TODO: Handle different error codes (stop handling all errors as if everything is fine and file is just missing...)
          return null
        })
      const result = {
        [domain]: {
          [area]: content
        }
      }
      return result
    }))
  console.log(content)

  return content.reduce((obj, res) => merge.recursive(obj, res))
}

const write = async (consentId, domain, area, data) => {
  const consents = await list(consentId, domain, area)
  const { accountId, pdsProvider, pdsCredentials } = consents[0]
  const path = `/${accountId}/data/${encodeURIComponent(domain)}/${encodeURIComponent(area)}${EXT}`
  const provider = pds.get({ pdsProvider, pdsCredentials })
  await provider.outputFile(path, data, 'utf8')
}

module.exports = {
  read,
  write
}
