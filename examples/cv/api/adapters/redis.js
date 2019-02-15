const Redis = require('ioredis')

const connectionString = process.env.REDIS || 'redis://:fubar@localhost:6380/'

const redis = new Redis(connectionString, {
  retryStrategy: (times) => {
    const maxReconnectTime = 50 * 1000
    return Math.min(times * 50, maxReconnectTime)
  }
})

module.exports = redis
