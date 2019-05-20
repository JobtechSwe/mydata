const Joi = require('joi-browser')
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
  iconURI: Joi.string().required(),
  jwksURI: Joi.string().uri().required(),
  eventsURI: Joi.string().uri().required()
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
  jti: Joi.string().required()
})

// device -> service
const CONNECTION_INIT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_INIT',
  jti: Joi.string().required()
})

const LAWFUL_BASIS = Joi.string()

const READ = Joi.object({
  id: Joi.string().uuid().required(),
  purpose: Joi.string().required(),
  lawfulBasis: LAWFUL_BASIS.required(),
  jwk: JWK.required()
})

const WRITE = Joi.object({
  id: Joi.string().uuid().required(),
  description: Joi.string().required(),
  lawfulBasis: LAWFUL_BASIS.required()
})

const LOCAL_ENTRY = Joi.object({
  read: READ,
  write: WRITE
})

const EXTERNAL_ENTRY = Joi.object({
  read: READ
})

const ANSWERED_READ = Joi.object({
  id: Joi.string().uuid().required(),
  purpose: Joi.string().required(),
  lawfulBasis: LAWFUL_BASIS.required(),
  jwks: Joi.array().allow(JWK).min(1)
})

const ANSWERED_WRITE = Joi.object({
  id: Joi.string().uuid().required(),
  description: Joi.string().required(),
  lawfulBasis: LAWFUL_BASIS.required()
})

const ANSWERED_LOCAL_ENTRY = Joi.object({
  read: ANSWERED_READ,
  write: ANSWERED_WRITE
})

const ANSWERED_EXTERNAL_ENTRY = Joi.object({
  read: ANSWERED_READ
})

const PERMISSIONS = Joi.object({
  local: Joi.object()
    .pattern(/.*/, LOCAL_ENTRY),
  external: Joi.object()
    .pattern(Joi.string().uri(), Joi.object()
      .pattern(/.*/, EXTERNAL_ENTRY))
})

const ANSWERED_PERMISSIONS = Joi.object({
  local: Joi.object()
    .pattern(/.*/, ANSWERED_LOCAL_ENTRY),
  external: Joi.object()
    .pattern(Joi.string().uri(), Joi.object()
      .pattern(/.*/, ANSWERED_EXTERNAL_ENTRY))
})

// service -> device
const CONNECTION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_REQUEST',
  permissions: PERMISSIONS,
  jti: Joi.string().uuid({ version: 'uuidv4' }).required()
})

// device -> operator
const CONNECTION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION',
  jti: Joi.string().required(),
  aud: Joi.array().items(Joi.string().uri()).min(1),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  permissions: ANSWERED_PERMISSIONS
})

// operator -> service
const CONNECTION_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_EVENT',
  payload: JWT.required() // CONNECTION
})

// device -> operator
const LOGIN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN',
  jti: Joi.string().required(),
  aud: Joi.array().items(Joi.string().uri())
})

// operator -> service
const LOGIN_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN_EVENT',
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
  type: 'DATA_WRITE',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  path: Joi.string().required(),
  data: JWE.required()
})

const deviceSchemas = [ACCOUNT_REGISTRATION, CONNECTION_INIT, CONNECTION, LOGIN]

module.exports = {
  algs,
  deviceSchemas,
  JOSE_HEADER,
  SERVICE_REGISTRATION,
  ACCOUNT_REGISTRATION,
  AUTHENTICATION_REQUEST,
  CONNECTION_INIT,
  CONNECTION_REQUEST,
  CONNECTION,
  CONNECTION_EVENT,
  LOGIN,
  LOGIN_EVENT,
  ACCESS_TOKEN,
  DATA_READ,
  DATA_WRITE
}
