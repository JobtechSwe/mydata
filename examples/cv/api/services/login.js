const { v4 } = require('uuid')

const clientId = process.env.CLIENT_ID

const loginRequest = () => {
  const sessionId = `session_${v4()}`
  const loginRequestPayload = JSON.stringify({
    sessionId,
    clientId
  })
  const base64urlPayload = Buffer.from(loginRequestPayload).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return {
    url: `mydata://login/${base64urlPayload}`,
    sessionId
  }
}

module.exports = {
  loginRequest
}
