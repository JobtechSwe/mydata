const axios = require('axios')
const { constant } = require('case')
const schemas = require('./schemas')

const fix = (consent) => ({
  ...consent,
  scope: Array.isArray(consent.scope)
    ? consent.scope.map(scope => ({
      ...scope,
      permissions: Array.isArray(scope.permissions)
        ? scope.permissions.map(p => constant(p))
        : scope.permissions,
      lawfulBasis: scope.lawfulBasis
        ? constant(scope.lawfulBasis)
        : scope.lawfulBasis
    }))
    : consent.scope
})

async function request (client, consentRequestDescription) {
  consentRequestDescription = fix(consentRequestDescription)
  await schemas.consentRequest.validate(consentRequestDescription)

  const encKey = await client.keyProvider.generateTempKey({ use: 'enc' })
  const data = {
    ...consentRequestDescription,
    clientId: client.config.clientId,
    kid: encKey.kid
  }
  const signature = await client.sign(data, 'client_key')
  const url = `${client.config.operator}/api/consents/requests`
  const response = await axios.post(url, { data, signature })
  return response.data.data
}

async function onApprove (client, consent) {
  const { keyProvider: { keyStore } } = client
  const keys = Object.entries(consent.keys)
    .map(([kid, str]) => ({
      kid,
      use: 'enc',
      publicKey: Buffer.from(str, 'base64').toString('utf8')
    }))
  const rxJwks = new RegExp(`^${client.config.jwksUrl}/`)
  const ownKeys = keys.filter(key => rxJwks.test(key.kid))
  const externalKeys = keys.filter(key => !rxJwks.test(key.kid))
  await Promise.all([
    Promise.all(ownKeys.map(key => keyStore.updateTTL(key.kid))),
    Promise.all(externalKeys.map(key => keyStore.saveKey(key)))
  ])
}

module.exports = client => ({
  request: (consentRequestDescription) => request(client, consentRequestDescription),
  onApprove: (consent) => onApprove(client, consent)
})
