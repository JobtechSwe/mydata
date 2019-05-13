const createError = require('http-errors')
const { verify } = require('../services/jwt')

function signed (...types) {
  return async function (req, res, next) {
    try {
      const token = req.method === 'POST'
        ? req.body
        : req.headers['Authorization'].split('Bearer ')[1]
      const { header, payload } = verify(token)
      if (!types.includes(payload.type)) {
        throw createError(400)
      }
      req.signed = {
        header,
        payload
      }
      next()
    } catch (err) {
      if (!err.status) {
        next(createError(401))
      } else {
        next(err)
      }
    }
  }
}

module.exports = signed
