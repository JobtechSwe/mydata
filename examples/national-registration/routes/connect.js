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

    const listener = async (event) => {
      // Check if consent is correct
      if (event.consentRequestId !== req.params.id) { return }
      client.events.removeListener('CONSENT_APPROVED', listener)
      await client.keyProvider.keyValueStore.save(`sessionId/${sessionId}`, event.consentId)

      // Prepare payload to send to operator
      const person = getPerson(sessionId)
      const payloadArray = Object.entries(person)
        .map(([ key, data ]) => ({
          domain: client.config.clientId,
          area: key,
          data
        }))

      // Write data
      try {
        await Promise.all(payloadArray.map(payload => client.data.auth(event.accessToken).write(payload)))
        res.write(`data: Done!\n\n`)
      } catch (error) {
        console.error(error)
        return res.end()
      }
    }

    client.events.on('CONSENT_APPROVED', listener)

    req.on('close', () => {
      // closed from client, stop listening for consent approved
      client.events.removeListener('CONSENT_APPROVED', listener)
    })
  })

  return router
}
