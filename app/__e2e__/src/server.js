import express, { json } from 'express'
import * as phone from './phone'

phone.setConfig({
  OPERATOR_URL: process.env.OPERATOR_URL,
})

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
  console.error(error)
  res.status(status || 500).send({ message, stack })
})

app.get('/health', (req, res, _) => {
  res.send('ok')
})

const port = process.env.PORT || 1337
app.listen(port, () => {
  console.info(`Listening on port ${port}`)
})
