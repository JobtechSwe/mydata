const { get, set, expire, persist, del } = require('../adapters/redis')

async function save (key, value, ttl) {
  await set(key, value)
  if (typeof ttl === 'number') {
    await expire(key, Math.round(ttl / 1000))
  } else {
    await persist(key)
  }
}

async function load (key) {
  return get(key)
}

async function remove (key) {
  return del(key)
}

module.exports = {
  save,
  load,
  remove
}
