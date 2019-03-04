const axios = require('axios')
const baseUrl = 'http://localhost:1337'

const call = method =>
  args => axios.post(`${baseUrl}/${method}`, { args })

module.exports = {
  createAccount: call('createAccount'),
  clearAccount: call('clearAccount'),
  setConfig: call('setConfig'),
  getConsentRequest: call('getConsentRequest'),
  approveConsentRequest: call('approveConsentRequest'),
}