const Joi = require('joi')

const keyStore = Joi.object({
  getKey: Joi.func().arity(1).required(),
  getKeys: Joi.func().arity(1).required(),
  saveKey: Joi.func().arity(2).required(),
  removeKey: Joi.func().arity(1).required(),
  updateTTL: Joi.func().arity(2).required()
}).unknown(true)

const consentRequestScopeEntry = Joi.object({
  domain: Joi.string().required(),
  area: Joi.string().required(),
  description: Joi.string().required(),
  permissions: Joi.array()
    .items(Joi.string().valid(['READ', 'WRITE']))
    .min(1).required(),
  purpose: Joi.string().required(),
  lawfulBasis: Joi.string().valid([
    'CONSENT',
    'CONTRACT',
    'LEGAL_OBLIGATION',
    'VITAL_INTERESTS',
    'PUBLIC_TASK',
    'LEGITIMATE_INTERESTS'
  ]).required()
})

const consentRequest = Joi.object({
  scope: Joi.array().items(consentRequestScopeEntry).min(1).required(),
  expiry: Joi.number().integer().positive().required()
})

const consentScopeEntry = consentRequestScopeEntry.keys({
  readKeys: Joi.array().items(Joi.string()).min(2).required()
})

const consent = Joi.object({
  consentRequestId: Joi.string().uuid().required(),
  consentId: Joi.string().uuid().required(),
  accessToken: Joi.string().required(),
  scope: Joi.array().items(consentScopeEntry).min(1).required(),
  keys: Joi.object().required()
}).required()

const dataUpdate = Joi.object({
  accountId: Joi.string().uuid().required(),
  data: Joi.object({})
})

const eventPayloads = {
  CONSENT_APPROVED: consent,
  DATA_UPDATE: dataUpdate
}

const event = (type) => Joi.object({
  type: Joi.string().valid([
    'CONSENT_APPROVED', 'DATA_UPDATE'
  ]).required(),
  payload: eventPayloads[type] || Joi.object().required()
})

const configSchema = Joi.object({
  clientId: Joi.string().uri({ allowRelative: false }).required(),
  displayName: Joi.string().required(),
  description: Joi.string().required().min(10),
  eventsPath: Joi.string().uri({ relativeOnly: true }).optional(),
  jwksPath: Joi.string().uri({ relativeOnly: true }).optional(),
  operator: Joi.string().uri().required(),
  clientKeys: Joi.object({
    publicKey: Joi.string().required(),
    privateKey: Joi.string().required()
  }).required(),
  keyStore: keyStore.required(),
  keyOptions: Joi.object().optional() // TODO: Describe key options
})

module.exports = {
  consentRequest,
  event,
  configSchema
}
