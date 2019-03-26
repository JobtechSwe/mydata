const { operatorHealth, redisHealth } = require('../services/health')
const { Router } = require('express')

const router = Router()

router.get('/', (req, res, next) => {
  const status = {
    operator: '?'
  }

  return operatorHealth()
    .then(() => {
      status.operator = 'OK'
    })
    .catch(() => {
      res.statusCode = 503
      status.operator = '!OK'
    })
    .then(() => {
      if (redisHealth()) {
        status.redis = 'OK'
      } else {
        res.statusCode = 503
        status.redis = '!OK'
      }
    })
    .finally(() => {
      res.send({
        status
      })

      return next()
    })
})

module.exports = router
