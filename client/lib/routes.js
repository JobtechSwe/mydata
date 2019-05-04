const createError = require('http-errors')
const { Router, json } = require('express')
const { event } = require('./schemas')
const { JWT } = require('@panva/jose')

const keyListHandler = ({ keyProvider }) => async (req, res, next) => {
  const keys = await keyProvider.jwksKeyList()
  res.send(keys)
}

const keyHandler = ({ keyProvider }) => async (req, res, next) => {
  const key = await keyProvider.jwksKey(req.params.kid)
  res.send(key)
}

const eventsHandler = client => async ({ body }, res, next) => {
  try {
    await event(body.type).validate(body)
    client.events.emit(body.type, body.payload)
    res.sendStatus(200)
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
  router.get(client.config.eventsPath, (req, res, next) => {
    console.log(req.headers.jwt)
    const payload = JWT.decode(req.headers.jwt)
    console.log(payload)
  })

  return router
}
