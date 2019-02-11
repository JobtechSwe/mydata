/* eslint camelcase: "off" */
const dropboxFs = require('dropbox-fs')
const axios = require('axios')

const redirect_uri = 'http://localhost:3000/settings/dropbox/callback'
const client_id = 'tsw50ay5z1j0k0k'
const client_secret = '0ke4iy96y7amb3g'
const host = 'https://api.dropbox.com'

const description = {
  name: 'Dropbox',
  link: `${host}/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}`,
  img: '/images/icons8-dropbox-50.png'
}

const formData = (obj) => Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&')

async function authorize (code) {
  const data = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code'
  }
  const response = await axios.post(`${host}/oauth2/token`, formData(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return response.data
}

function fixUtf8 (fs) {
  const _readFile = fs.readFile.bind(fs)
  fs.readFile = (remotePath, options = { encoding: null }, callback) => {
    _readFile(remotePath, options, (err, res) => {
      if (typeof options === 'function') {
        callback = options
        options = {
          encoding: null
        }
      } else if (typeof options === 'string') {
        options = {
          encoding: options
        }
      }
      if (err) {
        callback(err)
      } else {
        const { encoding } = options
        if (encoding) {
          res = Buffer.from(res, 'ascii').toString(encoding)
        }
        callback(null, res)
      }
    })
  }
  return fs
}

function getFs (props) {
  const fs = dropboxFs({ apiKey: props.apiKey })
  return fixUtf8(fs)
}

module.exports = {
  authorize,
  description,
  getFs
}
