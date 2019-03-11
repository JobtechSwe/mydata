const phone = require('./helpers/phone')
const { v4Regexp } = require('./helpers/regexp')

describe('Account', () => {
  beforeAll(async () => {
    await phone.setConfig({
      OPERATOR_URL: 'http://operator:3000/api'
    })
  })

  it('Can create account', async () => {
    const { data } = await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    expect(data.id).toMatch(v4Regexp)
  })
})