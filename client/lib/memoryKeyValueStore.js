class MemoryKeyStore {
  constructor () {
    this.store = {}
    this.timers = {}
    this.save = this.save.bind(this)
    this.load = this.load.bind(this)
    this.remove = this.remove.bind(this)
  }
  clearExpiry (key) {
    clearTimeout(this.timers[key])
    delete this.timers[key]
  }
  setExpiry (key, ttl) {
    this.clearExpiry(key)
    if (ttl) {
      this.timers[key] = setTimeout(() => this.remove(key), ttl)
    }
  }
  async save (key, value, ttl) {
    this.store[key] = value
    this.setExpiry(key, ttl)
  }
  async load (key) {
    return this.store[key]
  }
  async remove (key) {
    this.clearExpiry(key)
    delete this.store[key]
  }
}

module.exports = MemoryKeyStore
