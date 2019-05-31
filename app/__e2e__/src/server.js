import express, { json } from 'express'
import * as phone from './phone'

if (!process.env.OPERATOR_URL) {
  console.warn('OPERATOR_URL not set for app-server. SetConfig has to be used before app-server will be able to reach Operator')
} else {
  phone
    .setConfig({ OPERATOR_URL: process.env.OPERATOR_URL })
    .then(() => {
      console.info(`OPERATOR_URL set to ${process.env.OPERATOR_URL}`)
    })
}

const app = express()
app.use(json())
app.post('/:method', async ({ body = {}, params: { method } }, res, next) => {
  try {
    const result = await phone[method](body.args)
    res.send(result)
  } catch (err) {
    next(err)
  }
})

app.use((error, req, res, _) => {
  const { status, message, stack } = error
  console.error(`${status}: ${message}`)
  res.status(status || 500).send({ message, stack })
})

app.get('/health', (req, res, _) => {
  res.send('ok')
})

const port = process.env.PORT || 1337
app.listen(port, () => {
  console.info(`Listening on port ${port}`)
})
