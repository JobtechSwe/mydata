const redis = require('../adapters/redis')

async function save (key, value, ttl) {
  await redis.set(key, value)
  if (typeof ttl === 'number') {
    await redis.expire(key, Math.round(ttl / 1000))
  } else {
    await redis.persist(key)
  }
}

async function load (key) {
  return redis.get(key)
}

async function remove (key) {
  return redis.del(key)
}

module.exports = {
  save,
  load,
  remove
}
