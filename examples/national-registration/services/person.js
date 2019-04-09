const faker = require('faker/locale/sv')
const random = require('random-seed')

const getPerson = (id) => {
  if (!id) {
    throw Error('id must be specified')
  }
  const seed = random.create(id).range(1000)
  faker.seed(seed)

  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    city: faker.address.city(),
    country: 'Sverige', // faker.address.country(),
    zipCode: faker.address.zipCode(),
    streetAddress: faker.address.streetAddress()
  }
}

module.exports = {
  getPerson
}
