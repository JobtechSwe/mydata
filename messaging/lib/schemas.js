const Joi = require('joi')
const alg = 'RS256'

const JWT_DEFAULTS = {
  aud: Joi.string().required(),
  exp: Joi.number().required(),
  iat: Joi.number().required(),
  iss: Joi.string().uri().required()
}

const JWT = Joi.string()
const JWK = Joi.object({
  kid: Joi.string(),
  kty: Joi.string().valid('RSA').required(),
  use: Joi.string().valid(['sig', 'enc']).required(),
  e: Joi.string().valid('AQAB').required(),
  n: Joi.string().required()
})

const JOSE_HEADER = Joi.object({
  alg: Joi.string().valid([alg]).required(),
  kid: Joi.string().uri(),
  jwk: JWK
})

const CLIENT_REGISTRATION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CLIENT_REGISTRATION',
  displayName: Joi.string().required(),
  description: Joi.string().required(),
  eventsUrl: Joi.string().uri().required(),
  jwksUrl: Joi.string().uri().required()
})

// service -> device
const AUTHENTICATION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'AUTHENTICATION_REQUEST',
  jti: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  events: Joi.string().uri().required()
})

// device -> service
const REGISTRATION_INIT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'REGISTRATION_INIT',
  jti: Joi.string().required()
})

const PERMISSIONS = Joi.array()

// service -> device
const REGISTRATION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'REGISTRATION_REQUEST',
  permissions: PERMISSIONS.required(),
  jti: Joi.string().uuid({ version: 'uuidv4' }).required()
})

// device -> operator
const REGISTRATION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'REGISTRATION',
  jti: Joi.string().required(),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  permissions: PERMISSIONS.required()
})

// operator -> service
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

const deviceSchemas = [REGISTRATION_INIT, REGISTRATION, LOGIN]

module.exports = {
  alg,
  deviceSchemas,
  JOSE_HEADER,
  CLIENT_REGISTRATION,
  AUTHENTICATION_REQUEST,
  REGISTRATION_INIT,
  REGISTRATION_REQUEST,
  REGISTRATION,
  REGISTRATION_EVENT,
  LOGIN,
  LOGIN_EVENT
}
