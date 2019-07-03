const createError = require('http-errors')

function signed ({ verify }) {
  return async function (req, _res, next) {
    try {
      let token
      if (req.method === 'POST') {
        token = req.body
      } else {
        if (req.header('authorization')) {
          token = req.header('authorization').split('Bearer ')[1]
        }
      }
      if (!token) {
        throw createError(400)
      }
      try {
        const { header, payload } = await verify(token)
        req.token = token
        req.payload = payload
        req.header = header
      } catch (err) {
        throw createError(401, err)
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = {
  signed
}
