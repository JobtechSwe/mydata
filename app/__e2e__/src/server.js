import express, { json } from 'express'
import * as phone from './phone'

const app = express()
app.use(json())
app.post('/:method', async ({ body = {}, params: { method } }, res, next) => {
  try {
    const result = await phone[method](body)
    res.send(result)
  } catch (err) {
    next(err)
  }
})
app.use((error, req, res, next) => {
  const { status, message, stack } = error
  res.status(status || 500).send({ message, stack })
})

const port = process.env.PORT || 1337
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
