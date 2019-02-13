const MemoryKeyValueStore = require('../lib/memoryKeyValueStore')
describe('MemoryKeyValueStore', () => {
  let store
  beforeEach(() => {
    store = new MemoryKeyValueStore()
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.runAllTimers()
    jest.clearAllTimers()
  })
  it('saves and loads a value', async () => {
    const key = 'my_key'
    const value = 'my_value'
    await store.save(key, value)

    const result = await store.load(key)
    expect(result).toEqual(value)
  })
  it('it removes a value', async () => {
    const key = 'my_key'
    const value = 'my_value'
    await store.save(key, value)
    await store.remove(key)

    const result = await store.load(key)
    expect(result).toBeUndefined()
  })
  it('removes a key after ttl', async () => {
    const key = 'my_key'
    const value = 'my_value'
    const ttl = 1000
    await store.save(key, value, ttl)

    jest.advanceTimersByTime(ttl - 1)
    const result1 = await store.load(key)
    expect(result1).toEqual(value)

    jest.advanceTimersByTime(1)
    const result2 = await store.load(key)
    expect(result2).toBeUndefined()
  })
  it('removes expiry it ttl is unset', async () => {
    const key = 'my_key'
    const value = 'my_value'
    const ttl = 1000
    await store.save(key, value)

    jest.advanceTimersByTime(ttl - 1)
    const result1 = await store.load(key)
    expect(result1).toEqual(value)

    await store.save(key, value)

    jest.advanceTimersByTime(ttl)
    const result2 = await store.load(key)
    expect(result2).toEqual(value)
  })
})
