const { resolve } = require('path')

module.exports = {
  mode: 'production',
  target: 'node',
  entry: resolve(__dirname, 'src/server.js'),
  resolve: {
    alias: {
      'react-native': resolve(__dirname, 'src/native/react-native'),
      'react-native-config': resolve(__dirname, 'src/native/react-native-config'),
      'react-native-rsa-native': resolve(__dirname, 'src/native/react-native-rsa-native'),
      '@react-native-community/async-storage': resolve(__dirname, 'src/native/async-storage'),
      'isomorphic-webcrypto': resolve(__dirname, 'src/native/webcrypto.js'),
    },
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
}
