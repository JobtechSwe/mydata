const createError = require('http-errors')
const { Router, json } = require('express')
const { event } = require('./schemas')
const { JWT } = require('@panva/jose')
const { validateMessage, unsecuredMessages } = require('@mydata/messaging')
const { registrationHandler } = require('./registration')
const bodyParser = require('body-parser')

const keyListHandler = ({ keyProvider }) => async (req, res, next) => {
  const keys = await keyProvider.jwksKeyList()
  res.send(keys)
}

const keyHandler = ({ keyProvider }) => async (req, res, next) => {
  const key = await keyProvider.jwksKey(req.params.kid)
  res.send(key)
}

const messageHandler = client => async (req, res, next) => {
  try {
    const contentType = req.headers['content-type']
    if (contentType === 'application/json') {
      // TODO: Make all messages use the JWT format (and remove this block)
      await event(req.body.type).validate(req.body)
      client.events.emit(req.body.type, req.body.payload)
      res.sendStatus(200)
    } else if (contentType === 'application/jwt') {
      const message = JWT.decode(req.body)
      await validateMessage(message)

      if (!unsecuredMessages.includes(message.type)) {
        // TODO: Get key
        // TODO: Verify signature
      }

      req.message = message

      console.log('EVENT', message)
      client.events.emit(message.type, message)
      next()
    } else {
      throw createError(400, `Unhandled content-type ${contentType}`)
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
}

const handlers = {
  REGISTRATION_INIT: registrationHandler
}

module.exports = client => {
  const router = new Router()

  router.use(json())
  router.use(bodyParser.text({ type: 'application/jwt' }))

  router.get(client.config.jwksPath, keyListHandler(client))
  router.get(`${client.config.jwksPath}/:kid`, keyHandler(client))
  router.post(client.config.eventsPath, messageHandler(client), (req, res, next) => {
    if (!handlers[req.message.type]) {
      throw Error(`Missing handler for ${req.message.type}`)
    }

    handlers[req.message.type](req, res)
  })

  return router
}
