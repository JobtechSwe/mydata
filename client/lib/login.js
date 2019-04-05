function getUrl (client, sessionId) {
  const loginRequestPayload = JSON.stringify({
    sessionId,
    clientId: client.config.clientId
  })
  const base64urlPayload = Buffer.from(loginRequestPayload)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `mydata://login/${base64urlPayload}`
}

module.exports = client => ({
  getUrl: (sessionId) => getUrl(client, sessionId)
})
