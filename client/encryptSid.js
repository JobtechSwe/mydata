const { createCipheriv, scrypt, randomBytes } = require('crypto')
const { promisify } = require('util')
const sid = '5496ec1d-20b1-4e6c-a859-37459a5f17e7'
const secret = 'hello'

async function run () {
  const salt = randomBytes(16)
  const key = Buffer.concat([
    salt,
    await promisify(scrypt)(Buffer.from(secret, 'utf8'), salt, 16)
  ])
  console.log(key.length)
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encSid = Buffer.concat([iv, cipher.update(sid), cipher.final()]).toString('base64')
  console.log(sid)
  console.log(encSid)
}

run()
