const Joi = require('joi')
const schemas = require('./schemas')

const alg = 'RS256'

// Does not have a signature. Read more: https://tools.ietf.org/html/rfc7519#section-6
const unsecuredMessages = [ 'CONNECTION_INFO_REQUEST' ]

const validateMessage = async msg => {
  await Joi.object({
    type: Joi.string().valid(Object.keys(schemas)).required()
  }).validate({ type: msg.type })
  await schemas[msg.type].validate(msg)
}

const validateHeader = async header => {
  await schemas.JOSE_HEADER.validate(header)
}

module.exports = {
  alg,
  validateMessage,
  validateHeader,
  unsecuredMessages
}
