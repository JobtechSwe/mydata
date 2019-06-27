const phone = require('./helpers/phone')
const { v4Regexp } = require('./helpers/regexp')
const postgres = require('./helpers/operatorPostgres')

describe('Account', () => {
  beforeAll(async () => {
    await postgres.createOperatorDb()
    await phone.clearStorage()
  })
  afterEach(async () => {
    await phone.clearStorage()
    await postgres.clearOperatorDb()
  })

  it('Can create account', async () => {
    const account = await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    expect(account.id).toMatch(v4Regexp)
  })
})
