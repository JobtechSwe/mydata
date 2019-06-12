import { generateKey } from '../crypto'

export const generateTestAccount = async (kid) => {
  return {
    id: 'foo',
    pds: { provider: 'memory' },
    kid,
  }
}

export const generateTestKey = async (options) => {
  const key = await generateKey(options, 1024)
  return key
}