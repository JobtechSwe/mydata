const phone = require('./helpers/phone')
const { v4Regexp } = require('./helpers/regexp')
const { clearOperatorDb } = require('./helpers/operatorPostgres')

describe('Account', () => {
  beforeAll(async () => {
  })

  afterAll(async () => {
    await phone.clearAccount()
    await clearOperatorDb()
  })

  it('Can create account', async () => {
    const { data } = await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    expect(data.id).toMatch(v4Regexp)
  })
})
