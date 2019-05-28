const axios = require('axios')
const baseUrl = 'http://localhost:1337'

const call = method =>
  args => axios
    .post(`${baseUrl}/${method}`, { args })
    .then(res => res.data)
    .catch(err => {
      console.error('Phone server responded with error:')
      console.error(err.message)
      console.error(`\tmethod: ${method}\n\tpayload:\n${JSON.stringify({ args }, null, 2)}\n`)
      console.error(err.stack)
      throw err
    })

module.exports = {
  createAccount: call('createAccount'),
  clearAccount: call('clearAccount'),
  clearStorage: call('clearStorage'),
  setConfig: call('setConfig'),
  getConnections: call('getConnections'),
  handleAuthCode: call('handleAuthCode'),
  approveConnection: call('approveConnection')
}
