const Joi = require('joi')

const alg = 'RS256'

const header = Joi.object({
  typ: 'JWT',
  alg,
  kid: Joi.string().uri()
})

const jwtSpec = {
  aud: Joi.string(),
  exp: Joi.number(),
  iat: Joi.number(),
  iss: Joi.string().uri(),
  jti: Joi.string().uuid({ version: 'uuidv4' })
}

const authenticationRequest = Joi.object({
  ...jwtSpec,
  type: 'AUTHENTICATION_REQUEST',
  name: Joi.string(),
  description: Joi.string(),
  events: Joi.string().uri()
})

const clientRegistration = Joi.object({
  ...jwtSpec,
  type: 'CLIENT_REGISTRATION',
  displayName: Joi.string(),
  description: Joi.string(),
  eventsUrl: Joi.string().uri(),
  jwksUrl: Joi.string().uri()
})

module.exports = {
  alg,
  schemas: {
    header,
    authenticationRequest,
    clientRegistration
  }
}
