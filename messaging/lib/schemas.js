const Joi = require('joi-browser')
const algs = ['RS256', 'RS384', 'RS512']

const JWT_DEFAULTS = {
  aud: Joi.string().required(),
  exp: Joi.number().required(),
  iat: Joi.number().required(),
  iss: Joi.string().uri().required()
}

const JWK = Joi.object({
  kid: Joi.string().required(),
  kty: Joi.string().valid('RSA').required(),
  use: Joi.string().valid('sig', 'enc').required(),
  e: Joi.string().valid('AQAB').required(),
  n: Joi.string().required()
})

const JWK_PRIVATE = Joi.object({
  kid: Joi.string().required(),
  kty: Joi.string().valid('RSA').required(),
  use: Joi.string().valid('sig', 'enc').required(),
  e: Joi.string().valid('AQAB').required(),
  n: Joi.string().required(),
  d: Joi.string().required(),
  p: Joi.string().required(),
  dp: Joi.string().required(),
  q: Joi.string().required(),
  dq: Joi.string().required(),
  qi: Joi.string().required()
})

const JWKS = Joi.object({
  keys: Joi.array().items(JWK).min(1).required()
})

const JWS = Joi.string()
  .regex(/^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/)

const JOSE_HEADER = Joi.object({
  alg: Joi.string().valid(algs).required(),
  kid: Joi.string().uri(),
  jwk: JWK
}).required()

const JWE_RECIPIENT = Joi.object({
  encrypted_key: Joi.string().required(),
  header: Joi.object({
    alg: Joi.string().valid('RSA1_5', 'RSA-OAEP').required(),
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
  }).unknown(true).required()
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

const PERMISSION_BASE = {
  ...CONTENT_PATH,
  id: Joi.string().uuid().required(),
  type: Joi.string().valid('READ', 'WRITE').required(),
  lawfulBasis: LAWFUL_BASIS.required()
}

const READ_PERMISSION_REQUEST = Joi.object({
  ...PERMISSION_BASE,
  type: Joi.string().valid('READ').required(),
  purpose: Joi.string().required(),
  jwk: JWK.required()
})
const WRITE_PERMISSION_REQUEST = Joi.object({
  ...PERMISSION_BASE,
  type: Joi.string().valid('WRITE').required(),
  description: Joi.string().required()
})
const PERMISSION_REQUEST_ARRAY = Joi.array().items(
  READ_PERMISSION_REQUEST,
  WRITE_PERMISSION_REQUEST
)

const READ_PERMISSION = Joi.object({
  ...PERMISSION_BASE,
  type: Joi.string().valid('READ').required(),
  purpose: Joi.string().required(),
  kid: Joi.string().uri().required() // the key of the service which is allowed to READ
})
const WRITE_PERMISSION = {
  ...PERMISSION_BASE,
  type: Joi.string().valid('WRITE').required(),
  description: Joi.string().required(),
  jwks: JWKS.required() // a 'keychain' with the keys of all approved readers of this data point
}
const PERMISSION_ARRAY = Joi.array().items(
  READ_PERMISSION,
  WRITE_PERMISSION
)

const PERMISSION_DENIED = Joi.object({
  ...PERMISSION_BASE
})

// service -> operator
const PERMISSION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'PERMISSION_REQUEST',
  permissions: PERMISSION_ARRAY.min(1).required(),
  sub: Joi.string().uuid(),
  sid: Joi.string().uuid({ version: 'uuidv4' }).required()
}).required()

// service -> device
const CONNECTION_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_REQUEST',
  permissions: PERMISSION_REQUEST_ARRAY.min(1).optional(),
  sid: Joi.string().uuid({ version: 'uuidv4' }).required(),
  displayName: Joi.string().required(),
  description: Joi.string().required(),
  iconURI: Joi.string().required()
}).required()

// device -> (operator) -> service
const CONNECTION = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION',
  sid: Joi.string().required(),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(),
  permissions: Joi.object({
    approved: PERMISSION_ARRAY.min(1).optional(),
    denied: Joi.array().items(PERMISSION_DENIED)
      .min(1).optional()
  }).optional()
}).required()

// device -> operator
const CONNECTION_RESPONSE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_RESPONSE',
  payload: JWS.required() // A serialised CONNECTION
}).required()

// operator -> service
const CONNECTION_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_EVENT',
  payload: JWS.required() // A serialised CONNECTION
}).required()

// device -> (operator) -> service
const LOGIN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN',
  sid: Joi.string().required(),
  sub: Joi.string().uuid({ version: 'uuidv4' }).required()
}).required()

// device -> operator
const LOGIN_RESPONSE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN_RESPONSE',
  payload: JWS.required() // A serialised LOGIN
}).required()

// operator -> service
const LOGIN_EVENT = Joi.object({
  ...JWT_DEFAULTS,
  type: 'LOGIN_EVENT',
  payload: JWS.required() // A serialised LOGIN
}).required()

// operator -> service
const ACCESS_TOKEN = Joi.object({
  ...JWT_DEFAULTS,
  type: 'ACCESS_TOKEN',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required()
}).required()

// service -> operator
const DATA_READ_REQUEST = Joi.object({
  ...JWT_DEFAULTS,
  type: 'DATA_READ_REQUEST',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(), // connection id
  paths: Joi.array().items(Joi.object({
    domain: Joi.string().uri().optional(),
    area: Joi.string().optional()
  })).min(1).optional()
}).required()

const DATA_READ_RESPONSE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'DATA_READ_RESPONSE',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(), // connection id
  paths: Joi.array().items(Joi.object({
    ...CONTENT_PATH,
    data: JWE.optional(),
    error: Joi.object({
      message: Joi.string().required(),
      status: Joi.number().integer().min(400).max(599).optional(),
      code: Joi.string().optional(),
      stack: Joi.string().optional()
    })
  })).min(1).optional()
})

// service -> operator
const DATA_WRITE = Joi.object({
  ...JWT_DEFAULTS,
  type: 'DATA_WRITE',
  sub: Joi.string().uuid({ version: 'uuidv4' }).required(), // connection id
  paths: Joi.array().items(Joi.object({
    ...CONTENT_PATH,
    data: JWE.optional()
  })).min(1).optional()
}).required()

const deviceSchemas = [ACCOUNT_REGISTRATION, CONNECTION_INIT, CONNECTION, CONNECTION_RESPONSE, LOGIN, LOGIN_RESPONSE]

module.exports = {
  algs,
  deviceSchemas,
  ACCESS_TOKEN,
  ACCOUNT_REGISTRATION,
  AUTHENTICATION_REQUEST,
  CONNECTION,
  CONNECTION_EVENT,
  CONNECTION_INIT,
  CONNECTION_REQUEST,
  CONNECTION_RESPONSE,
  DATA_READ_REQUEST,
  DATA_READ_RESPONSE,
  DATA_WRITE,
  JOSE_HEADER,
  JWK,
  JWKS,
  JWK_PRIVATE,
  LOGIN,
  LOGIN_EVENT,
  LOGIN_RESPONSE,
  PERMISSION_REQUEST,
  SERVICE_REGISTRATION
}
