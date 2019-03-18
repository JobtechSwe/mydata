const { Router } = require('express')
const createError = require('http-errors')
const { basename } = require('path')

const { create, get, del, login } = require('../../services/accounts')
const { signed } = require('../../middleware/auth')
const pds = require('../../adapters/pds')

const router = Router()

// Create account
router.post('/', signed({ accountKey: true }), async ({ originalUrl, body }, res, next) => {
  try {
    const result = await create(body)
    res.status(201).send({
      data: result,
      links: {
        self: `${originalUrl}/${encodeURIComponent(result.id)}`
      }
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

// Get account
router.get('/:accountId', async ({ originalUrl, params: { accountId } }, res, next) => {
  try {
    const account = await get(accountId)
    if (!account) {
      return next(createError(404))
    }
    res.send({
      data: {
        id: account.id,
        accountKey: account.accountKey,
        pds: {
          provider: account.pdsProvider
        }
      },
      links: {
        self: originalUrl
      }
    })
  } catch (error) {
    next(error)
  }
})

// Delete account
router.delete('/:accountId', async ({ params: { accountId } }, res, next) => {
  try {
    await del(accountId)
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

// Log in to client
router.post('/:accountId/login', async (req, res, next) => {
  const { params: { accountId }, body } = req
  try {
    await login(accountId, body)
    res.send('Login successful')
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error))
    } else {
      next(error)
    }
  }
})

// Get your mydata
router.get('/:accountId/data/:area?', async (req, res, next) => {
  const fs = pds.get(req.token.account)
  let areas
  if (req.params.area) {
    areas = [`${req.params.area}.json`]
  } else {
    areas = await fs.readdir('/data')
  }

  if (areas.length === 0) {
    return res.status(200).send({
      data: {},
      links: { self: req.originalUrl }
    })
  }

  const data = await Promise.all(areas.map(async area => ({ [basename(area, '.json')]: JSON.parse(await fs.readFile(`/data/${area}`, { encoding: 'utf8' })) })))

  if (!data) {
    return next(createError(404))
  }

  res.status(200).send({
    data: Object.assign(...data),
    links: { self: req.originalUrl }
  })
})

module.exports = router
