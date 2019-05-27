const { sign } = require('./jwt')
const { keys, host } = require('./config')

async function createConnectionEvent (audience, payload) {
  return sign({
    type: 'CONNECTION_EVENT',
    payload,
    iss: host,
    aud: audience
  }, keys.privateKey, {
    kid: keys.publicKey.kid
  })
}

module.exports = {
  createConnectionEvent
}
