const { addExpiry } = require('../../../api/services/consents')

describe('addExpiry', () => {
  it('adds correct expiry', () => {
    const nowMock = () => 1547025969000 // timestamp in milliseconds
    const durationInSeconds = 60

    const defaultRequest = {
      scope: []
    }

    const request = addExpiry(nowMock)(defaultRequest)(durationInSeconds)
    expect(request.expiry).toBe(1547025969 + 60)
  })
})
