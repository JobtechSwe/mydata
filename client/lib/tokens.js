const axios = require('axios')
const { sign } = require('./jwt')

const createServiceRegistration = (client) => async () => {
  const jwtStuff = {
    aud: client.config.operator,
    iss: client.config.clientId
  }

  const claimsSet = {
    type: 'SERVICE_REGISTRATION',
    displayName: client.config.displayName,
    description: client.config.description,
    eventsURI: client.config.eventsURI,
    jwksURI: client.config.jwksURI,
    iconURI: client.config.iconURI,
    ...jwtStuff
  }

  const key = client.keyProvider.clientKey
  return sign(claimsSet, key, { kid: key.kid })
}

const createAuthenticationRequest = (client) => async (id) => {
  const claimsSet = {
    type: 'AUTHENTICATION_REQUEST',
    sid: id,
    aud: 'mydata://account',
    iss: client.config.clientId,
    eventsURI: client.config.eventsURI
  }

  const key = client.keyProvider.clientKey
  return sign(claimsSet, key, { kid: key.kid })
}

const createConnectionRequest = (client) => (sid, permissions) => {
  const claimsSet = {
    type: 'CONNECTION_REQUEST',
    aud: 'mydata://account',
    iss: client.config.clientId,
    sid,
    displayName: client.config.displayName,
    description: client.config.description,
    iconURI: client.config.iconURI,
    permissions
  }

  const key = client.keyProvider.clientKey
  return sign(claimsSet, key, { kid: key.kid })
}

const createWriteDataToken = (client) =>
  async (connectionId, paths) => {
    const claimsSet = {
      type: 'DATA_WRITE',
      sub: connectionId,
      aud: client.config.operator,
      iss: client.config.clientId,
      paths: paths.map(({ domain, area, data }) => {
        domain = domain || client.config.clientId
        return { domain, area, data }
      })
    }
    const key = client.keyProvider.clientKey
    return sign(claimsSet, key, { kid: key.kid })
  }

const createReadDataToken = (client) =>
  async (connectionId, paths) => {
    const claimsSet = {
      type: 'DATA_READ_REQUEST',
      sub: connectionId,
      aud: client.config.operator,
      iss: client.config.clientId,
      paths: paths.map(({ domain, area }) => {
        domain = domain || client.config.clientId
        return { domain, area }
      })
    }
    const key = client.keyProvider.clientKey
    return sign(claimsSet, key, { kid: key.kid })
  }

const createAccessToken = (client) => async (sub) => {
  const claimsSet = {
    type: 'ACCESS_TOKEN',
    sub,
    aud: client.config.clientId,
    iss: client.config.clientId
  }
  const key = client.keyProvider.clientKey
  return sign(claimsSet, key, { kid: key.kid })
}

const send = async (url, token) => {
  const headers = { 'content-type': 'application/jwt' }
  const response = await axios.post(url, token, { headers })
  return response.data
}

module.exports = (client) => ({
  createServiceRegistration: createServiceRegistration(client),
  createAuthenticationRequest: createAuthenticationRequest(client),
  createConnectionRequest: createConnectionRequest(client),
  createWriteDataToken: createWriteDataToken(client),
  createReadDataToken: createReadDataToken(client),
  createAccessToken: createAccessToken(client),
  send
})
