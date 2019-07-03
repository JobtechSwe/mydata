const { Router } = require('express')
const router = Router()
const { domain } = require('../services/consents')

module.exports = operator => {
  router.get('/:area?', async ({ headers, params: { area } }, res, next) => {
    const accessToken = headers.authorization.split('Bearer ')[1]
    if (!accessToken) {
      return next(Error('Invalid authorization header'))
    }

    try {
      const data = await operator.data.auth(accessToken).read({ domain })
      res.send(data[domain])
    } catch (error) {
      next(error)
    }
  })

  router.post('/:area', async ({ headers, body, params: { area } }, res, next) => {
    const accessToken = headers.authorization.split('Bearer ')[1]
    if (!accessToken) {
      return next(Error('Invalid authorization header'))
    }

    try {
      const data = body
      await operator.data.auth(accessToken).write({ domain, area, data })

      res.sendStatus(201)
    } catch (error) {
      next(error)
    }
  })

  return router
}
