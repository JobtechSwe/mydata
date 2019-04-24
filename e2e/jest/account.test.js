const phone = require('./helpers/phone')
const { v4Regexp } = require('./helpers/regexp')
const { clearOperatorDb } = require('./helpers/operatorPostgres')

describe('Account', () => {
  afterAll(async () => {
    await phone.clearAccount()
    await clearOperatorDb()
  })

  it('Can create account', async () => {
    const account = await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    expect(account.id).toMatch(v4Regexp)
  })
})
