const { Router } = require('express')
const { middleware: { signed } } = require('@mydata/messaging')
const jwt = require('../services/jwt')
const health = require('./health')
const messages = require('../messages')

const router = Router()

/* home page. */
router.get('/', (req, res, next) => {
  res.send({ name: 'Smooth Operator' })
})

/* health route */
router.use('/health', health)

/* communication */
router.use('/api', signed(jwt), async (req, res, next) => {
  try {
    await messages.handle(req, res)
  } catch (error) {
    next(error)
  }
})

module.exports = router
