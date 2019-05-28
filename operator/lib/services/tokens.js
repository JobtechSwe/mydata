const { sign } = require('./jwt')
const { keys, host } = require('./config')

async function createConnectionEvent (serviceId, payload) {
  return sign({
    type: 'CONNECTION_EVENT',
    payload,
    iss: host,
    aud: serviceId
  }, keys.privateKey, {
    kid: keys.publicKey.kid
  })
}

const createLoginEvent = async (payload, serviceId) => {
  return sign({
    type: 'LOGIN_EVENT',
    aud: serviceId,
    iss: host,
    payload
  }, keys.privateKey, {
    kid: keys.publicKey.kid
  })
}

module.exports = {
  createConnectionEvent,
  createLoginEvent
}
