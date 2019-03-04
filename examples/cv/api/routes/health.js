const { Router } = require('express')
const router = Router()

const postgres = require('../adapters/postgres')
const redis = require('../adapters/redis')

const http = require('http')

function operatorHealth() {
  return new Promise((resolve, reject) => {
    http.get(process.env.OPERATOR_URL + '/health', operatorResponse => {
      let data = ''
  
      operatorResponse.on('data', chunk => {
        data += chunk
      })
  
      operatorResponse.on('end', () => {
        if (operatorResponse.statusCode != 200) {
          return reject()
        } else {
          return resolve()
        }
      })
    }).on('error', error => {
      return reject(error)
    })
  })
}

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
    return postgres.query('SELECT NOW()')
  })
  .then(() => {
    status.postgres = 'OK'
  })
  .catch(error => {
    res.statusCode = 503
    status.postgres = '!OK'
  })
  .then(() => {
    if (redis.status === 'ready') {
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
