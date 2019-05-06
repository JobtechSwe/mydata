const createError = require('http-errors')
const { Router, json } = require('express')
const { event } = require('./schemas')
const { JWT } = require('@panva/jose')
const { validateMessage, unsecuredMessages } = require('@mydata/messaging')

const keyListHandler = ({ keyProvider }) => async (req, res, next) => {
  const keys = await keyProvider.jwksKeyList()
  res.send(keys)
}

const keyHandler = ({ keyProvider }) => async (req, res, next) => {
  const key = await keyProvider.jwksKey(req.params.kid)
  res.send(key)
}

const eventsHandler = client => async ({ body, headers, header }, res, next) => {
  try {
    if (headers['content-type'] === 'application/json') {
      // TODO: Make all messages use the JWT format (and remove this block)
      await event(body.type).validate(body)
      client.events.emit(body.type, body.payload)
      res.sendStatus(200)
    } else if (headers['content-type'] === 'application/jwt') {
      const message = JWT.decode(body)
      await validateMessage(message)

      if (!unsecuredMessages.includes(message.type)) {
        // TODO: Get key
        // TODO: Verify signature
      }

      client.events.emit(message.type, message)

      // TODO: Handle messages here

      res.sendStatus(200)
    } else {
      throw createError(400, `Unhandled content-type ${headers['content-type']}`)
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
}

module.exports = client => {
  const router = new Router()

  router.use(json())

  router.get(client.config.jwksPath, keyListHandler(client))
  router.get(`${client.config.jwksPath}/:kid`, keyHandler(client))
  router.post(client.config.eventsPath, eventsHandler(client))

  return router
}
