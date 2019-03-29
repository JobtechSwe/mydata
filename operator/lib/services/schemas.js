const Joi = require('joi')

/**
 * Options
 */
const defaultOptions = {
  abortEarly: false,
  convert: false
}

const isUnsafe = () => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
const allowedSchemes = () => isUnsafe() ? [ 'http', 'https' ] : [ 'https' ]

/**
 * Schemas
 */

// Fields
const clientId = Joi.string().uri({ scheme: allowedSchemes() }).required()
const accountKey = Joi.string().base64().required()

// Accounts
const accountId = Joi.string().uuid().required()

const createAccount = Joi.object({
  accountKey,
  pds: Joi.object({
    provider: Joi.string().required(),
    access_token: Joi.string().required()
  }).required().unknown(true)
}).required().unknown(true)

// Clients
const registerClient = Joi.object({
  clientId,
  displayName: Joi.string().required(),
  description: Joi.string().required().min(10),
  eventsUrl: Joi.string().uri({ scheme: allowedSchemes() }).required(),
  jwksUrl: Joi.string().uri({ scheme: allowedSchemes() }).required()
}).required()

// Consent
const consentRequest = Joi.object({
  clientId,
  kid: Joi.string().uri({ scheme: allowedSchemes() }).required(),
  scope: Joi.array().items(Joi.object({
    domain: Joi.string().required(),
    area: Joi.string().required(),
    description: Joi.string().required(),
    permissions: Joi.array().items(
      Joi.string().required()
    ).required().min(1),
    purpose: Joi.string().required(),
    lawfulBasis: Joi.string().required(),
    required: Joi.bool().allow()
  })).required().min(1),
  expiry: Joi.number().required()
}).required()

const scopeEntry = Joi.object({
  domain: Joi.string().uri().required(),
  area: Joi.string().required(),
  clientEncryptionDocumentKey: Joi.string().base64().optional()
}).unknown(true)

const consent = Joi.object({
  consentRequestId: Joi.string().guid().required(),
  consentEncryptionKey: Joi.string().base64().required(),
  consentEncryptionKeyId: Joi.string().required(),
  accountId: Joi.string().guid().required(),
  accountKey,
  clientId,
  scope: Joi.array().items(scopeEntry).min(1).required()
}).required()

// Signatures
const signature = Joi.object({
  alg: Joi.string().required(),
  data: Joi.string().required(),
  kid: Joi.string().required()
}).required()

const signedPayloadWithAccountKey = Joi.object({
  data: Joi.object({
    accountKey
  }).required().unknown(true),
  signature
}).required()

const signedPayloadWithClientKey = Joi.object({
  data: Joi.object({
    clientKey: Joi.string().required()
  }).required().unknown(true),
  signature
}).required()

const signedPayloadWithKeyId = Joi.object({
  data: Joi.object({
    clientId
  }).required().unknown(true),
  signature
}).required()

module.exports = {
  defaultOptions,
  isUnsafe,

  accountId,
  createAccount,

  registerClient,

  consentRequest,
  consent,

  signedPayloadWithAccountKey,
  signedPayloadWithClientKey,
  signedPayloadWithKeyId
}
