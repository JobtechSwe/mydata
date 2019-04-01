const { Router } = require('express')
const QRCode = require('qrcode')

const unixNow = () => Math.floor(new Date() / 1000)

const writeData = client => accessToken => client
  .data
  .auth(accessToken)
  .write({
    domain: client.config.clientId,
    area: 'city',
    data: 'Örebro'
  })

const setCookie = (id, link) => response => response.cookie('consentRequest', { id, link }, {
  expires: new Date(Date.now() + 1000 * 60 * 5)
})

module.exports = client => {
  const router = Router()

  router.get('/', async (req, res, next) => {
    if (req.cookies.consentRequest) {
      const { id, link } = await client.consents.request({
        scope: [
          {
            domain: client.config.clientId,
            area: 'city',
            description: 'The city where you are registrated.',
            purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
            lawfulBasis: 'CONSENT',
            permissions: ['write']
          }
        ],
        expiry: unixNow() + 24 * 3600
      })

      setCookie(res)(id, link)
    } else {
      const accessToken = await client.keyProvider.keyValueStore.load(`id/${req.cookies.consentRequest.id}`).then(x => x && x.accessToken)
      if (!accessToken) {
        const qr = await QRCode.toString(req.cookies.consentRequest.link, {
          type: 'svg'
        })
        res.render('auth', {
          qr,
          id: req.cookies.consentRequest.id,
          link: req.cookies.consentRequest.link
        })
      }
    }

    if (req.cookies.consentRequest) {
      const accessToken = await client.keyProvider.keyValueStore.load(`id/${req.cookies.consentRequest.id}`).then(x => x && x.accessToken)
      if (accessToken) {
        res.clearCookie('consentRequest')
        writeData(client)(accessToken)
      } else {

      }
    } else {
      const qr = await QRCode.toString(link, {
        type: 'svg'
      })
      res.render('auth', {
        qr,
        id
      })
    }
  })

  return router
}

// const { Router } = require('express')
// const QRCode = require('qrcode')

// const unixNow = () => Math.floor(new Date() / 1000)

// module.exports = client => {
//   const router = Router()

//   router.get('/', async (req, res, next) => {
//     let _id, _link
//     if (req.cookies.consentRequest) {
//       _id = req.cookies.consentRequest.id
//       _link = req.cookies.consentRequest.link

//       if (!store.get(_id)) {
//         res.clearCookie('consentRequest')
//       } else if (store.get(_id).accessToken) {
//         // Write data
//         client.data
//           .auth(store.get(_id).accessToken)
//           .write({
//             domain: client.config.clientId,
//             area: 'city',
//             data: 'Örebro'
//           })

//         res.clearCookie('consentRequest')
//         res.redirect('/done')
//       }
//     } else {
//       const { id, link } = await client.consents.request({
//         scope: [
//           {
//             domain: client.config.clientId,
//             area: 'city',
//             description: 'The city where you are registrated.',
//             purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
//             lawfulBasis: 'CONSENT',
//             permissions: [ 'write' ]
//           }
//         ],
//         expiry: unixNow() + 24 * 3600
//       })

//       store.set(id, {
//         handled: false
//       })
//       res.cookie('consentRequest', { id, link }, {
//         expires: new Date(Date.now() + 1000 * 60 * 5)
//       })

//       _id = id
//       _link = link
//     }

//     const qr = await QRCode.toString(_link, {
//       type: 'svg'
//     })

//     res.render('auth', {
//       qr,
//       _id
//     })
//   })

//   return router
// }
