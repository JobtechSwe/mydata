const createMemoryStore = () => {
  const timeouts = new Map()
  const store = new Map()
  return {
    save: async (key, value, ttl) => {
      store.set(key, value)

      clearTimeout(timeouts.get(key))
      if (ttl) {
        const ttlMilliseconds = ttl * 1000
        timeouts.set(key, setTimeout(() => store.delete(key), ttlMilliseconds))
      }
    },
    load: async (key) => {
      return store.get(key)
    },
    remove: async (key) => {
      clearTimeout(timeouts.get(key))
      return store.delete(key)
    },
    removeAll: async function () {
      for (const [key] of timeouts.entries()) {
        await this.remove(key)
      }
    },
    isMemoryStore: true
  }
}

module.exports = {
  createMemoryStore
}
