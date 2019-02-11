const { Router } = require('express')
const { create } = require('../../services/clients')
const createError = require('http-errors')
const { signed } = require('../../middleware/auth')
const schemas = require('../../services/schemas')

const router = Router()

// Register
router.post('/', signed(), async ({ body, signature: { key } }, res, next) => {
  try {
    await schemas.registerClient().validate(body, schemas.defaultOptions)
    const result = await create({
      ...body,
      clientKey: key
    })

    res.send(result)
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

module.exports = router
