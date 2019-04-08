const { Router } = require('express')
const createError = require('http-errors')
const consentService = require('../../services/consents')
const { signed } = require('../../middleware/auth')

const router = Router()

router.post('/', signed({ accountKey: true }), async ({ body }, res, next) => {
  try {
    await consentService.create(body)
    res.send('ok')
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

router.post('/requests', signed(), async ({ body, signature }, res, next) => {
  try {
    if (!signature.client) {
      throw createError(500, 'Requesting consent before client is registered is not allowed')
    }
    const consentRequestData = await consentService.createRequest(body, signature)
    if (!consentRequestData) {
      throw createError(404)
    }
    res.status(201).send({ data: consentRequestData })
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

router.get('/requests/:id', async ({ params }, res, next) => {
  try {
    const data = await consentService.getRequest(params.id)

    if (!data) {
      return res.sendStatus(404)
    }

    res.send(data)
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

module.exports = router
