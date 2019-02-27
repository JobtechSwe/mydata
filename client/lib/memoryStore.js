const createMemoryStore = () => {
  const store = new Map()
  return {
    save: async (key, value, ttl) => {
      // TODO: Respect ttl
      return store.set(key, value)
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
