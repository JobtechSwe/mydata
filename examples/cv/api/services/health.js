const axios = require('axios')
const redis = require('../adapters/redis')

const operatorHealth = async () => {
  try {
    await axios.get(process.env.OPERATOR_URL + '/health')
    return true
  } catch (error) {
    throw new Error('Could not connect to operator')
  }
}

const redisHealth = () => redis.status === 'ready'

module.exports = {
  operatorHealth,
  redisHealth
}
