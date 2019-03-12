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

/*
baseData: {
  firstName: 'Adam',
    lastName: 'Naeslund',
      headline: 'Looking for opportunities'
},
education: [
  {
    schoolName: 'Uppsala University',
    fieldOfStudy: 'Computer Science'
  }
],
  languages: [
    {
      languageName: 'Swedish',
      proficiency: 'Native'
    },
    {
      languageName: 'English',
      proficiency: 'Fluent'
    },
    {
      languageName: 'Javascript',
      proficiency: 'Fluent'
    }
  ],
    experience: [
      {
        employer: 'Iteam',
        title: 'Developer',
        fromDate: '2017',
        toDate: '2019',
        description: 'Developing software and other various things'
      },
      {
        employer: 'Posten AB',
        title: 'Mail Delivery Technican Assistent Manager',
        fromDate: '2012',
        toDate: '2017',
        description: 'Did things'
      }
    ]
  }
  */
