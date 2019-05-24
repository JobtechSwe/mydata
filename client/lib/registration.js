
const registrationHandler = ({ payload }, res) => {
  console.log('Handling connection', payload)
  res.sendStatus(200)
}

module.exports = {
  registrationHandler
}
