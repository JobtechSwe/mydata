const Joi = require('joi')
const { curry, pipe } = require('ramda')

// NOTE: Joi returns something that can both be interpreted as
// a object and as a Promise. This means that if awaited it will
// throw an error. If not awaited it will return an object with an
// error-property which is not null.
const validate = curry((schema, body) => Joi.validate(
  body, schema, { abortEarly: false, convert: false })
)

const afterValidation = f => item =>
  item.error
    ? item
    : f(item.value)

const withValidation = schema => f => pipe(
  validate(schema),
  afterValidation(f)
)

module.exports = {
  withValidation,
  validate,
  Joi
}
