import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

jest.mock('AsyncStorage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}))

jest.mock('axios')
jest.mock('react-native-config', () => ({
  Config: {},
}))

jest.mock('react-native-fontawesome', () => jest.fn())

console.error = jest.fn()
