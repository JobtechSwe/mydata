const Joi = require('joi')

const JWT_DEFAULTS = {
  aud: Joi.string().required(),
  exp: Joi.number().required(),
  iat: Joi.number().required(),
  iss: Joi.string().uri().required()
}

const JWT = Joi.string()

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

const REGISTRATION_INIT = Joi.object({
  type: 'REGISTRATION_INIT',
  jti: Joi.string().required(),
  aud: Joi.string().required()
})

const PERMISSIONS = Joi.array()

// From client to operator
const REGISTRATION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'REGISTRATION_REQUEST',
  permissions: PERMISSIONS.required(),
  jti: Joi.string().uuid({ version: 'uuidv4' }).required()
})

const REGISTRATION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'REGISTRATION',
  jti: Joi.string().required(),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  permissions: PERMISSIONS.required()
})

const REGISTRATION_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'REGISTRATION_EVENT',
  accessToken: JWT.required(),
  payload: JWT.required() // REGISTRATION
})

const LOGIN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN',
  jti: Joi.string().required(),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required()
})

const LOGIN_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN_EVENT',
  accessToken: JWT.required(),
  payload: JWT.required() // LOGIN
})

module.exports = {
  CLIENT_REGISTRATION,
  AUTHENTICATION_REQUEST,
  REGISTRATION_INIT,
  REGISTRATION_REQUEST,
  REGISTRATION,
  REGISTRATION_EVENT,
  LOGIN,
  LOGIN_EVENT
}
