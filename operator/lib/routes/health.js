const { Router } = require('express')

const postgres = require('../adapters/postgres')
const redis = require('../adapters/redis')

const router = Router()

router.get('/', async (req, res, next) => {
  let statusCode = 200
  const status = {
    postgres: '?',
    redis: '?'
  }

  try {
    await postgres.query('SELECT NOW()')
    status.postgres = 'OK'
  } catch (error) {
    statusCode = 503
    status.postgres = '!OK'
  }

  if (redis.status() === 'ready') {
    status.redis = 'OK'
  } else {
    statusCode = 503
    status.redis = '!OK'
  }

  res.status(statusCode).send(status)
})

module.exports = router
