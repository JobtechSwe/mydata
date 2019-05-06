
const registrationHandler = ({ message }, res) => {
  console.log('Handling registration', message)
  res.send('ok')
}

module.exports = {
  registrationHandler
}
