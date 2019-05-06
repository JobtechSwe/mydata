const Joi = require('joi')

const JWT_DEFAULTS = {
  aud: Joi.string().required(),
  exp: Joi.number().required(),
  iat: Joi.number().required(),
  iss: Joi.string().uri().required(),
  jti: Joi.string().uuid({ version: 'uuidv4' })
}

const AUTHENTICATION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'AUTHENTICATION_REQUEST',
  name: Joi.string().required(),
  description: Joi.string().required(),
  events: Joi.string().uri().required()
})

const CLIENT_REGISTRATION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CLIENT_REGISTRATION',
  displayName: Joi.string().required(),
  description: Joi.string().required(),
  eventsUrl: Joi.string().uri().required(),
  jwksUrl: Joi.string().uri().required()
})

// const PERMISSIONS = Joi.object({
// }).unknown

const REGISTRATION_INIT = Joi.object({
  type: 'REGISTRATION_INIT',
  jti: Joi.string().uuid({ version: 'uuidv4' }),
  aud: Joi.string().required()
})

const CONNECTION_INFO = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_INFO',
  permissions: Joi.array().required()
})

module.exports = {
  AUTHENTICATION_REQUEST,
  CLIENT_REGISTRATION,
  REGISTRATION_INIT,
  CONNECTION_INFO
}
