const Redis = require('ioredis')

const connectionString = process.env.REDIS || 'redis://:fubar@localhost:6380/'

const redis = new Redis(connectionString, {
  retryStrategy: (times) => {
    const maxReconnectTime = 50 * 1000
    const delay = Math.min(times * 50, maxReconnectTime)
    console.error(`Could not connect to redis, retrying in ${delay} ms`)
    return delay
  }
})

module.exports = redis
