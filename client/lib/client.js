const axios = require('axios')
const { createSign } = require('crypto')
const routes = require('./routes')
const consents = require('./consents')
const data = require('./data')
const KeyProvider = require('./keyProvider')
const { EventEmitter } = require('events')
const { configSchema } = require('./schemas')

const defaults = {
  jwksPath: '/jwks',
  eventsPath: '/events',
  alg: 'RSA-SHA512'
}

class Client {
  constructor (config) {
    this.config = {
      ...defaults,
      ...config
    }
    this.config.jwksUrl = `${config.clientId}${config.jwksPath}`
    this.config.eventsUrl = `${config.clientId}${config.eventsPath}`
    this.keyProvider = new KeyProvider(this.config)
    this.routes = routes(this)
    this.consents = consents(this)
    this.data = data(this)
    this.events = new EventEmitter()

    this.connect = this.connect.bind(this)
    this.sign = this.sign.bind(this)

    this.events.on('CONSENT_APPROVED', this.consents.onApprove.bind(this))
  }
  async sign (data, kid) {
    const keyPair = await this.keyProvider.getKey(kid)

    return {
      kid: keyPair.kid,
      alg: this.config.alg,
      data: createSign(this.config.alg)
        .update(JSON.stringify(data))
        .sign(keyPair.privateKey, 'base64')
    }
  }

  async onConsentApproved (payload) {
    await this.consents.onApprove(payload)
  }

  async connect () {
    const {
      operator, displayName, description, clientId, jwksUrl, eventsUrl
    } = this.config
    const data = { displayName, description, clientId, jwksUrl, eventsUrl }
    const signature = await this.sign(data, 'client_key')
    const result = await axios.post(`${operator}/api/clients`, { data, signature })
    this.events.emit('CONNECTED', result)
  }
}

function create (config) {
  const { error } = configSchema.validate(config)
  if (error) {
    throw error
  }
  const client = new Client(config)
  return client
}

module.exports = create
