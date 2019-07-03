const axios = require('axios')
const appServerUrl = process.env.APP_SERVER_URL || 'http://localhost:1337'

const serialize = (args) => args.map((arg) => ((arg instanceof Map || arg instanceof Set) ? [...arg] : arg))

const call = (method) =>
  (...args) => {
    // console.log(method, JSON.stringify(serialize(args), null, 2))
    return axios
      .post(`${appServerUrl}/${method}`, { args: serialize(args) })
      .then(res => res.data)
      .catch(err => {
        const error = err.response.data
        console.error('Phone server responded with error:')
        console.error(error.message)
        console.error(`\tmethod: ${method}\n\tpayload:\n${JSON.stringify({ args }, null, 2)}\n`)
        console.error(error.stack)
        throw err
      })
  }

module.exports = {
  createAccount: call('createAccount'),
  getAccount: call('getAccount'),
  getAccountKeys: call('getAccountKeys'),
  clearAccount: call('clearAccount'),
  clearStorage: call('clearStorage'),
  setConfig: call('setConfig'),
  getConnections: call('getConnections'),
  handleAuthCode: call('handleAuthCode'),
  approveConnection: call('approveConnection'),
  approveLogin: call('approveLogin')
}
