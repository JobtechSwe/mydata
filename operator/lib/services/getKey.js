const axios = require('axios')

const getKey = kid => axios
  .get(kid)
  .then(({ data }) => data)
  .catch(err => {
    console.error('could not get key from kid', err)
    throw Error(err)
  })

module.exports = {
  getKey
}
