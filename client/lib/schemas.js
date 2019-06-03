const Joi = require('joi')
const { schemas: { PERMISSION } } = require('@egendata/messaging')

const keyValueStore = Joi.object({
  load: Joi.func().required(),
  save: Joi.func().required(),
  remove: Joi.func().required()
}).unknown(true)

const configSchema = Joi.object({
  clientId: Joi.string().uri({ allowRelative: false }).required(),
  displayName: Joi.string().required(),
  description: Joi.string().required().min(10),
  iconURI: Joi.string().uri().optional(),
  eventsPath: Joi.string().uri({ relativeOnly: true }).optional(),
  jwksPath: Joi.string().uri({ relativeOnly: true }).optional(),
  operator: Joi.string().uri().required(),
  clientKeys: Joi.object({
    publicKey: Joi.string().required(),
    privateKey: Joi.string().required()
  }).required(),
  keyValueStore: keyValueStore.required(),
  keyOptions: Joi.object().optional(), // TODO: Describe key options
  defaultPermissions: Joi.array().items(Joi.object({
    area: Joi.string().required(),
    types: Joi.array().items(
      Joi.string().valid('READ', 'WRITE').required()
    ).required(),
    purpose: Joi.string().optional(),
    description: Joi.string().optional()
  })
  ).min(1).optional()
})

module.exports = {
  configSchema
}
