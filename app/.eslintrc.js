module.exports = {
  root: true,
  parser: 'babel-eslint',
  settings: {
    react: {
      createClass: 'createReactClass',
      pragma: 'React',
      version: 'detect',
    },
  },
  extends: [
    '@react-native-community',
    'standard',
    'plugin:jest/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  plugins: ['jest'],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'jsx-quotes': ['error', 'prefer-double'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'object-curly-spacing': ['error', 'always'],
    quotes: ['error', 'single'],
    'react/prop-types': 'off',
    semi: ['error', 'never'],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'space-before-function-paren': [2, { anonymous: 'always', named: 'never' }],
    'react-native/no-inline-styles': [0],
  },
}
