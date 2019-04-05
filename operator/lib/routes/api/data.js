const { Router } = require('express')
const { verify } = require('../../services/jwt')
const { read, write } = require('../../services/data')

const router = Router()

router.get('/:domain?/:area?', async (req, res, next) => {
  try {
    const authHeader = req.header('authorization')
    const [, accessToken] = authHeader.split('Bearer ')
    const { data: { consentId } } = verify(accessToken)

    const domain = req.params.domain
      ? decodeURIComponent(req.params.domain)
      : null
    const area = req.params.area
      ? decodeURIComponent(req.params.area)
      : null

    const data = await read(consentId, domain, area)
    res.send({ data })
  } catch (error) {
    next(error)
  }
})

router.post('/:domain?/:area?', async (req, res, next) => {
  try {
    const authHeader = req.header('authorization')
    const [, accessToken] = authHeader.split('Bearer ')
    const { data: { consentId } } = verify(accessToken)

    const domain = req.params.domain
      ? decodeURIComponent(req.params.domain)
      : null
    const area = req.params.area
      ? decodeURIComponent(req.params.area)
      : null
    const data = req.body.data

    await write(consentId, domain, area, data)
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
})

module.exports = router
