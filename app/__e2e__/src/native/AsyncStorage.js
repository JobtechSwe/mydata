let storage = {}

const AsyncStorage = {
  getItem: async (key) => {
    return storage[key]
  },
  setItem: async (key, value) => {
    storage[key] = value
  },
  clear: async () => {
    storage = {}
  }
}

module.exports = AsyncStorage
