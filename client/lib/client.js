const axios = require('axios')
const { createSign } = require('crypto')
const routes = require('./routes')
const consents = require('./consents')
const login = require('./login')
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
    this.connected = false
    this.connecting = false
    this.config.jwksUrl = `${config.clientId}${config.jwksPath}`
    this.config.eventsUrl = `${config.clientId}${config.eventsPath}`
    this.keyProvider = new KeyProvider(this.config)
    this.routes = routes(this)
    this.consents = consents(this)
    this.login = login(this)
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

  async connect (retry = 0, reconnect = false) {
    if (this.connected) {
      return
    }
    if (this.connecting && !reconnect) {
      return new Promise((resolve) => {
        this.events.on('CONNECTED', () => resolve())
      })
    }
    this.connecting = true
    const {
      operator, displayName, description, clientId, jwksUrl, eventsUrl
    } = this.config
    const data = { displayName, description, clientId, jwksUrl, eventsUrl }
    const signature = await this.sign(data, 'client_key')
    try {
      this.events.emit('CONNECTING', retry)
      const result = await axios.post(`${operator}/api/clients`, { data, signature })
      this.connected = true
      this.connecting = false
      this.events.emit('CONNECTED', result)
    } catch (err) {
      this.events.emit('CONNECTION ERROR', err)
      const timeout = Math.min(1000 * Math.pow(2, retry++), 5000)
      await new Promise(resolve => setTimeout(resolve, timeout))
      return this.connect(retry, true)
    }
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
