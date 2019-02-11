module.exports = (api) => {
  api.cache(true)

  return {
    presets: [
      'module:metro-react-native-babel-preset'
    ],
    sourceMaps: 'inline',
    plugins: [
      ["@babel/plugin-transform-flow-strip-types"],
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      ["@babel/plugin-proposal-class-properties", { "loose": true }]
    ]
  }
}