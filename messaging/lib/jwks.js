const axios = require('axios')

async function getKey (kid) {
  try {
    const { data } = await axios.get(kid)
    return data
  } catch (error) {
    throw new Error(`No key found for kid: ${kid}`)
  }
}

async function getKeys (kids) {
  const keyMap = {}
  let kid
  try {
    for (kid of kids) {
      const { data } = await axios.get(kid)
      keyMap[data.kid] = data
    }
    return keyMap
  } catch (error) {
    throw new Error(`No key found for kid: ${kid}`)
  }
}

module.exports = { getKey, getKeys }
