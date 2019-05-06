const createMemoryStore = () => {
  const store = new Map()
  return {
    save: async (key, value, ttl) => {
      store.set(key, value)

      if (ttl) {
        const ttlMilliseconds = ttl * 1000
        setTimeout(() => store.delete(key), ttlMilliseconds)
      }
    },
    load: async (key) => {
      return store.get(key)
    },
    remove: async (key) => {
      return store.delete(key)
    },
    isMemoryStore: true
  }
}

module.exports = {
  createMemoryStore
}
