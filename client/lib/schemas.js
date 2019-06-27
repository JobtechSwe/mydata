const Joi = require('@hapi/joi')

const keyValueStore = Joi.object({
  load: Joi.func().arity(1).required(),
  save: Joi.func().arity(3).required(),
  remove: Joi.func().arity(1).required()
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
    // todo: make this require purpose for read and description for write
    purpose: Joi.string(),
    description: Joi.string()
  })
  ).min(1).optional()
})

module.exports = {
  configSchema
}
