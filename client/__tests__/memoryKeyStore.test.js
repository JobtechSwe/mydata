const MemoryKeyStore = require('../lib/memoryKeyStore')

describe('MemoryKeyStore', () => {
  let storage
  beforeEach(() => {
    storage = new MemoryKeyStore()
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.runAllTimers()
    jest.clearAllTimers()
  })
  it('returns keys', async () => {
    expect(await storage.getKeys('enc')).toEqual([])
    expect(await storage.getKeys('sig')).toEqual([])
    expect(await storage.getKey('kid')).toBeFalsy()
  })
  it('stores an enc key and returns it', async () => {
    const key = { use: 'enc', kid: 'enc1' }
    await storage.saveKey(key)
    expect(await storage.getKeys('enc')).toEqual([key])
  })
  it('stores a sig key and returns it', async () => {
    const key = { use: 'sig', kid: 'sig1' }
    await storage.saveKey(key)
    expect(await storage.getKeys('sig')).toEqual([key])
  })
  it('filters on use', async () => {
    const sigKey = { use: 'sig', kid: 'sig1' }
    const encKey = { use: 'enc', kid: 'enc1' }
    await storage.saveKey(sigKey)
    await storage.saveKey(encKey)
    expect(await storage.getKeys('sig')).toEqual([sigKey])
  })
  it('removes on kid', async () => {
    const sigKey1 = { use: 'sig', kid: 'sig1' }
    const sigKey2 = { use: 'sig', kid: 'sig2' }
    const encKey = { use: 'enc', kid: 'enc1' }
    await storage.saveKey(sigKey1)
    await storage.saveKey(sigKey2)
    await storage.saveKey(encKey)
    await storage.removeKey('sig1')
    expect(await storage.getKeys('sig')).toEqual([sigKey2])
  })
  it('auto deletes keys after ttl', async () => {
    const encKey = { use: 'enc', kid: 'enc1' }
    await storage.saveKey(encKey, 1000)

    jest.advanceTimersByTime(999)
    let key = await storage.getKey('enc1')
    expect(key).toBeTruthy()

    jest.advanceTimersByTime(1000)
    key = await storage.getKey('enc1')
    expect(key).toBeFalsy()
  })
  it('updates ttl', async () => {
    const encKey = { use: 'enc', kid: 'enc1' }
    await storage.saveKey(encKey, 1000)

    jest.advanceTimersByTime(999)
    let key = await storage.getKey('enc1')
    expect(key).toBeTruthy()

    await storage.updateTTL(encKey.kid, 1000)

    jest.advanceTimersByTime(999)
    key = await storage.getKey('enc1')
    expect(key).toBeTruthy()

    jest.advanceTimersByTime(1000)
    key = await storage.getKey('enc1')
    expect(key).toBeFalsy()
  })
  it('updates ttl to null', async () => {
    const encKey = { use: 'enc', kid: 'enc1' }
    await storage.saveKey(encKey, 1000)

    jest.advanceTimersByTime(999)
    let key = await storage.getKey('enc1')
    expect(key).toBeTruthy()

    await storage.updateTTL(encKey.kid, null)

    jest.advanceTimersByTime(2000)
    key = await storage.getKey('enc1')
    expect(key).toBeTruthy()
  })
})
