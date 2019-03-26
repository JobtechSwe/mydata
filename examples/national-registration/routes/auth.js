const { Router } = require('express')
const QRCode = require('qrcode')

const unixNow = () => Math.floor(new Date() / 1000)

const store = new Map()

module.exports = client => {
  const router = Router()

  client.events.on('CONSENT_APPROVED', event => {
    store.set(event.id, {
      accessToken: event.accessToken
    })
  })

  router.get('/', async (req, res, next) => {
    let _id, _link
    if (req.cookies.consentRequest) {
      _id = req.cookies.consentRequest.id
      _link = req.cookies.consentRequest.link

      if (!store.get(_id)) {
        res.clearCookie('consentRequest')
      } else if (store.get(_id).accessToken) {
        // Write data
        client.data
          .auth(store.get(_id).accessToken)
          .write({
            domain: client.config.clientId,
            area: 'city',
            data: 'Örebro'
          })

        res.clearCookie('consentRequest')
        res.redirect('/done')
      }
    } else {
      const { id, link } = await client.consents.request({
        scope: [
          {
            domain: client.config.clientId,
            area: 'city',
            description: 'The city where you are registrated.',
            purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
            lawfulBasis: 'CONSENT',
            permissions: [ 'write' ]
          }
        ],
        expiry: unixNow() + 24 * 3600
      })

      store.set(id, {
        handled: false
      })
      res.cookie('consentRequest', { id, link }, {
        expires: new Date(Date.now() + 1000 * 60 * 5)
      })

      _id = id
      _link = link
    }

    const qr = await QRCode.toString(_link, {
      type: 'svg'
    })

    res.render('auth', {
      qr,
      _id
    })
  })

  return router
}
