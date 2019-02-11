describe('adapters/operator', () => {
  let operatorClient
  beforeAll(async () => {
    process.env.CLIENT_ID = 'http://localhost:4000'
    process.env.OPERATOR_URL = 'http://localhost:3000'
    operatorClient = require('../../../api/adapters/operator')
  })
  it('can be created', () => {
    expect(operatorClient).toBeTruthy()
  })
})
