let storage = {}

export const AsyncStorage = {
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

export const Linking = {
  addEventListener: () => { },
  removeEventListener: () => { },
  openURL: () => { }
}
