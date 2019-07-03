import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Crypto } from '@peculiar/webcrypto'

Enzyme.configure({ adapter: new Adapter() })

jest.mock('@react-native-community/async-storage', () => {
  const storage = {}
  return {
    setItem: jest.fn(async (key, val) => {
      return (storage[key] = val)
    }),
    getItem: jest.fn(async key => storage[key]),
    removeItem: jest.fn(async key => {
      storage[key] = undefined
    }),
  }
})

jest.mock('axios')
jest.mock('react-native-config', () => ({
  Config: {},
}))

jest.doMock('isomorphic-webcrypto', () => new Crypto())

console.error = jest.fn()
