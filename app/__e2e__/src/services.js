const proxyquire = require('proxyquire').noCallThru()
const AsyncStorage = require('./native/AsyncStorage')
const RSA = require('./native/RSA')
const Config = require('./native/Config')

const mocks = {
  'react-native': {
    AsyncStorage,
    Linking: {
      addEventListener: () => {},
      removeEventListener: () => {},
      openURL: () => {}
    },
    '@global': true
  },
  'react-native-config': Object.assign(Config, { '@global': true }),
  'react-native-rsa-native': {
    RSA,
    '@global': true
  }
}

module.exports = {
  account: proxyquire('../../services/account', mocks),
  consents: proxyquire('../../services/consents', mocks),
  crypto: proxyquire('../../services/crypto', mocks),
  dropbox: proxyquire('../../services/dropbox', mocks),
  jwks: proxyquire('../../services/jwks', mocks),
  JwksClient: proxyquire('../../services/JwksClient', mocks),
  rsaUtils: proxyquire('../../services/rsaUtils', mocks),
  storage: proxyquire('../../services/storage', mocks),
  Config
}
