const Joi = require('joi-browser')
const algs = ['RS256', 'RS384', 'RS512']

const JWT_DEFAULTS = {
  aud: Joi.string().required(),
  exp: Joi.number().required(),
  iat: Joi.number().required(),
  iss: Joi.string().uri().required()
}

const JWK = Joi.object({
  kid: Joi.string(),
  kty: Joi.string().valid('RSA').required(),
  use: Joi.string().valid(['sig', 'enc']).required(),
  e: Joi.string().valid('AQAB').required(),
  n: Joi.string().required()
})

const JOSE_HEADER = Joi.object({
  alg: Joi.string().valid(algs).required(),
  kid: Joi.string().uri(),
  jwk: JWK
}).required()

const JWE_RECIPIENT = Joi.object({
  encrypted_key: Joi.string().required(),
  header: Joi.object({
    alg: Joi.string().valid('RSA1_5').required(),
    kid: Joi.string().uri(),
    jwk: JWK
  }).or('kid', 'jwk')
}).required()
const JWE = Joi.object({
  recipients: Joi.array().items(JWE_RECIPIENT).min(1),
  protected: Joi.string(),
  iv: Joi.string().required(),
  ciphertext: Joi.string().required(),
  tag: Joi.string()
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
  sid: Joi.string().required(),
  eventsURI: Joi.string().uri().required()
}).required()

// device -> service
const CONNECTION_INIT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_INIT',
  sid: Joi.string().required()
}).required()

const LAWFUL_BASIS = Joi.string().valid('CONSENT')

const CONTENT_PATH = {
  domain: Joi.string().uri().required(),
  area: Joi.string().required()
}

const PERMISSION = {
  ...CONTENT_PATH,
  id: Joi.string().uuid().required(),
  type: Joi.string().valid('READ', 'WRITE').required(),
  purpose: Joi.string(),
  description: Joi.string(),
  lawfulBasis: LAWFUL_BASIS
}

// service -> operator
const PERMISSION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'PERMISSION_REQUEST',
  permissions: Joi.array().items(Joi.object({
    ...PERMISSION,
    key: JWK
  })).min(1).required(),
  sub: Joi.string().uuid(),
  sid: Joi.string().uuid({ version: 'uuidv4' }).required()
}).required()

// service -> device
const CONNECTION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_REQUEST',
  permissions: Joi.array().items(Joi.object({
    ...PERMISSION,
    key: JWK
  })).min(1).optional(),
  sid: Joi.string().uuid({ version: 'uuidv4' }).required(),
  displayName: Joi.string().required(),
  description: Joi.string().required(),
  iconURI: Joi.string().required()
}).required()

// device -> operator
const CONTENT_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONTENT_REQUEST',
  contentPaths: Joi.array()
    .items(Joi.object({ ...CONTENT_PATH }))
    .min(1).required()
}).required()

// operator -> device
const CONTENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONTENT',
  content: Joi.array().items(Joi.object({
    ...CONTENT_PATH,
    data: JWE
  }))
}).required()

// device -> (operator) -> service
const CONNECTION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION',
  sid: Joi.string().required(),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  permissions: Joi.array().items(Joi.object({
    ...PERMISSION,
    kid: Joi.string().uri(),
    keys: Joi.array().items(JWK)
  })).min(1).optional()
}).required()

// device -> operator
const CONNECTION_RESPONSE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_RESPONSE',
  content: Joi.array().items(Joi.object({
    ...CONTENT_PATH,
    data: JWE
  })),
  payload: Joi.string().required()
}).required()

// operator -> service
const CONNECTION_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_EVENT',
  payload: Joi.string().required()
}).required()

// device -> (operator) -> service
const LOGIN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN',
  sid: Joi.string().required()
}).required()

// device -> operator
const LOGIN_RESPONSE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN_RESPONSE',
  payload: Joi.string().required()
}).required()

// operator -> service
const LOGIN_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN_EVENT',
  payload: Joi.string().required()
}).required()

// operator -> service
const ACCESS_TOKEN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'ACCESS_TOKEN',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required()
}).required()

// service -> operator
const DATA_READ = Joi.object({
  ...JWT_DEFAULTS,
  type: 'DATA_READ',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  path: Joi.string().required()
}).required()

// service -> operator
const DATA_WRITE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'DATA_WRITE',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  path: Joi.string().required(),
  data: JWE.required()
}).required()

const deviceSchemas = [ACCOUNT_REGISTRATION, CONNECTION_INIT, CONNECTION, CONNECTION_RESPONSE, LOGIN, LOGIN_RESPONSE]

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
  CONNECTION_RESPONSE,
  CONNECTION_EVENT,
  CONTENT_REQUEST,
  CONTENT,
  LOGIN,
  LOGIN_RESPONSE,
  LOGIN_EVENT,
  PERMISSION_REQUEST,
  ACCESS_TOKEN,
  DATA_READ,
  DATA_WRITE
}
