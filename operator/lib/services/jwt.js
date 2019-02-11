const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET || 'sdfkjshkfjsdofdsj'

function createToken (data) {
  return jwt.sign({ data }, secret)
}

function verify (token) {
  return jwt.verify(token, secret)
}

module.exports = { createToken, verify }
