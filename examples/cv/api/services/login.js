const { v4 } = require('uuid')

const loginRequest = (operator) => {
  const sessionId = `session_${v4()}`
  const url = operator.login.getUrl(sessionId)

  return {
    sessionId,
    url
  }
}

module.exports = {
  loginRequest
}
