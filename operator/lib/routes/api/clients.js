const { Router } = require('express')
const { create } = require('../../services/clients')
const { get: getConsent } = require('../../services/consents')
const createError = require('http-errors')
const { jwtVerifier } = require('../../middleware/auth')
const schemas = require('../../services/schemas')
const { validateMessage } = require('@mydata/messaging')

const router = Router()

// Register
router.post('/', jwtVerifier, async ({ body }, res, next) => {
  try {
    console.log('* * * * * /clients * * * * *')
    const { claimsSet } = body

    await validateMessage(claimsSet)

    console.log(claimsSet)
    const { displayName, description, eventsUrl, jwksUrl } = claimsSet
    const clientId = claimsSet.iss

    const result = await create({
      displayName,
      description,
      eventsUrl,
      jwksUrl,
      clientId,
      clientKey: 'remove-this-column'
    })

    res.send(result)
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

// todo: check signature
router.get('/:clientId/consents', async (req, res, next) => {
  try {
    const accountId = req.query.accountId
    const clientId = req.params.clientId
    await schemas.getClientConsents.validate({ accountId, clientId }, schemas.defaultOptions)
    const result = await getConsent(accountId, clientId)
    res.send(result)
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

module.exports = router
