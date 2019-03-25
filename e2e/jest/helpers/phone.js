const axios = require('axios')
const baseUrl = 'http://localhost:1337'

const call = method =>
  args => axios.post(`${baseUrl}/${method}`, { args }).catch(err => {
    console.error('Phone server responded with error:')
    console.error(err)
    throw err
  })

module.exports = {
  createAccount: call('createAccount'),
  clearAccount: call('clearAccount'),
  setConfig: call('setConfig'),
  getConsentRequest: call('getConsentRequest'),
  approveConsentRequest: call('approveConsentRequest')
}
