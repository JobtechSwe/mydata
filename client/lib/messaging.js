const Joi = require('joi')

const alg = 'RS256'

const JOSE_HEADER = Joi.object({
  typ: 'JWT',
  alg,
  kid: Joi.string().uri()
})

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

const CONNECTION_INFO_REQUEST = Joi.object({
  type: 'CONNECTION_INFO_REQUEST',
  aud: Joi.string().required(),
  permissions: Joi.array().required()
})

const CONNECTION_INFO = Joi.object({
  ...JWT_DEFAULTS,
  type: 'CONNECTION_INFO'
})

const schemas = {
  AUTHENTICATION_REQUEST,
  CLIENT_REGISTRATION,
  CONNECTION_INFO_REQUEST,
  CONNECTION_INFO
}

const unsecuredMessages = [
  'CONNECTION_INFO_REQUEST'
]

const validateMessage = async msg => {
  await Joi.object({
    type: Joi.string().valid(Object.keys(schemas)).required()
  }).validate({ type: msg.type })
  await schemas[msg.type].validate(msg)
}

const validateHeader = async header => {
  await JOSE_HEADER.validate(header)
}

module.exports = {
  alg,
  validateMessage,
  validateHeader,
  unsecuredMessages
}
