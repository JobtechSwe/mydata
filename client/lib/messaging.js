const Joi = require('joi')

const alg = 'RS256'

const header = Joi.object({
  typ: 'JWT',
  alg,
  kid: Joi.string().uri()
})

const jwtSpec = {
  aud: Joi.string().required(),
  exp: Joi.number().required(),
  iat: Joi.number().required(),
  iss: Joi.string().uri().required(),
  jti: Joi.string().uuid({ version: 'uuidv4' })
}

const authenticationRequest = Joi.object({
  ...jwtSpec,
  type: 'AUTHENTICATION_REQUEST',
  name: Joi.string().required(),
  description: Joi.string().required(),
  events: Joi.string().uri().required()
})

const clientRegistration = Joi.object({
  ...jwtSpec,
  type: 'CLIENT_REGISTRATION',
  displayName: Joi.string().required(),
  description: Joi.string().required(),
  eventsUrl: Joi.string().uri().required(),
  jwksUrl: Joi.string().uri().required()
})

module.exports = {
  alg,
  schemas: {
    header,
    authenticationRequest,
    clientRegistration
  }
}
