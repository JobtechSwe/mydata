const axios = require('axios')
const routes = require('./routes')
const data = require('./data')
const KeyProvider = require('./keyProvider')
const { EventEmitter } = require('events')
const { configSchema } = require('./schemas')
const { v4 } = require('uuid')
const { createAuthenticationUrl } = require('./auth')
const tokens = require('./tokens')

const defaults = {
  jwksPath: '/jwks',
  eventsPath: '/events',
  alg: 'RS256'
}

class Client {
  constructor (config) {
    this.config = {
      ...defaults,
      ...config
    }
    this.connected = false
    this.connecting = false
    this.config.jwksURI = `${config.clientId}${config.jwksPath}`
    this.config.eventsURI = `${config.clientId}${config.eventsPath}`
    this.keyProvider = new KeyProvider(this.config)
    this.routes = routes(this)
    this.tokens = tokens(this)
    this.data = data(this)
    this.events = new EventEmitter()
    this.keyValueStore = config.keyValueStore

    this.connect = this.connect.bind(this)
  }

  async initializeAuthentication () {
    const id = v4()
    const authReq = await this.tokens.createAuthenticationRequest(id)
    const url = createAuthenticationUrl(authReq)

    const AUTHENTICATION_REQUEST_ID_PREFIX = 'authenticationRequest|>'
    const seconds = 5 * 60
    this.keyValueStore.save(`${AUTHENTICATION_REQUEST_ID_PREFIX}${id}`, authReq, seconds)

    return {
      id,
      url
    }
  }

  async getAuthentication (id) {
    const AUTHENTICATION_ID_PREFIX = 'authentication|>'
    return this.keyValueStore.load(`${AUTHENTICATION_ID_PREFIX}${id}`)
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

    const serviceRegistration = await this.tokens.createServiceRegistration()
    try {
      this.events.emit('CONNECTING', retry)
      const result = await axios.post(`${this.config.operator}/api`, serviceRegistration, { headers: { 'content-type': 'application/jwt' } })
      this.connected = true
      this.connecting = false
      this.events.emit('CONNECTED', result)
    } catch (err) {
      this.events.emit('CONNECTION ERROR', err)
      const timeout = Math.min(1000 * Math.pow(2, retry++), 5000)
      await new Promise((resolve) => setTimeout(resolve, timeout))
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
