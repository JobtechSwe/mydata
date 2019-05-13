const Joi = require('joi')
const algs = ['RS256', 'RS384', 'RS512']

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
const JWE = Joi.string()

const JOSE_HEADER = Joi.object({
  alg: Joi.string().valid(algs).required(),
  kid: Joi.string().uri(),
  jwk: JWK
})

// service -> operator
const SERVICE_REGISTRATION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'SERVICE_REGISTRATION',
  displayName: Joi.string().required(),
  description: Joi.string().required(),
  eventsUrl: Joi.string().uri().required(),
  jwksUrl: Joi.string().uri().required()
})

// device -> operator
const ACCOUNT_REGISTRATION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'ACCOUNT_REGISTRATION',
  pds: Joi.object({
    provider: Joi.string().required(),
    access_token: Joi.string()
  }).required()
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
  aud: Joi.array().items(Joi.string().uri()),
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

// device -> operator
const LOGIN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN',
  jti: Joi.string().required(),
  aud: Joi.array().items(Joi.string().uri()),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required()
})

// operator -> service
const LOGIN_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN_EVENT',
  accessToken: JWT.required(),
  payload: JWT.required() // LOGIN
})

// operator -> service
const ACCESS_TOKEN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'ACCESS_TOKEN',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required()
})

// service -> operator
const DATA_READ = Joi.object({
  ...JWT_DEFAULTS,
  type: 'DATA_READ',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  path: Joi.string().required()
})

// service -> operator
const DATA_WRITE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'DATA_READ',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  path: Joi.string().required(),
  data: JWE.required()
})

const deviceSchemas = [ACCOUNT_REGISTRATION, REGISTRATION_INIT, REGISTRATION, LOGIN]

module.exports = {
  algs,
  deviceSchemas,
  JOSE_HEADER,
  SERVICE_REGISTRATION,
  ACCOUNT_REGISTRATION,
  AUTHENTICATION_REQUEST,
  REGISTRATION_INIT,
  REGISTRATION_REQUEST,
  REGISTRATION,
  REGISTRATION_EVENT,
  LOGIN,
  LOGIN_EVENT,
  ACCESS_TOKEN,
  DATA_READ,
  DATA_WRITE
}
