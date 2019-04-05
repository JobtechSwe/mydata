const { Router } = require('express')
const { generateScope } = require('./../services/scope')
const { getPerson } = require('./../services/person')
const QRCode = require('qrcode')

const unixNow = () => Math.floor(new Date() / 1000)

module.exports = client => {
  const router = Router()

  router.get('/', async (req, res, next) => {
    if (!req.cookies.consentRequest) {
      const consentRequest = {
        scope: generateScope(client.config.clientId),
        expiry: unixNow() + 24 * 3600
      }

      const { id, url } = await client.consents.request(consentRequest)
      const qr = await QRCode.toString(url, { type: 'svg' })
      return res.json({
        id,
        url,
        qr
      })
    }
  })

  router.get('/:id', async (req, res, next) => {
    const sessionId = req.cookies.sessionId

    res.status(200).set({
      'connection': 'keep-alive',
      'cache-control': 'no-cache',
      'content-Type': 'text/event-stream'
    })

    client.events.on('CONSENT_APPROVED', async function listener (event) {
      // Check if consent is correct
      if (event.consentRequestId !== req.params.id) { return }

      // Clear listener
      client.events.removeListener('CONSENT_APPROVED', listener)

      const person = getPerson(sessionId)

      // Use accessToken to write data
      try {
        await client.data.auth(event.accessToken).write({
          domain: client.config.clientId,
          area: 'firstName',
          data: person.firstName
        })

        await client.data.auth(event.accessToken).write({
          domain: client.config.clientId,
          area: 'lastName',
          data: person.lastName
        })

        res.write(`data: Done!\n\n`)
      } catch (error) {
        console.error(error)
        return res.end()
      }
    })

    req.on('close', () => {
      console.log('closed from client, discarding temporary request')
      // TODO: client.events.removeListener('CONSENT_APPROVED', listener)
    })
  })

  return router
}
