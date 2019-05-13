const { Router } = require('express')
const signed = require('../middleware/signed')
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
router.use('/api', signed(), async (req, res, next) => {
  try {
    const response = await messages.handle(req.payload)
    res.write(response)
    next()
  } catch (error) {
    next(error)
  }
})

module.exports = router
