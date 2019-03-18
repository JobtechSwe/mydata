const dropbox = require('../../lib/adapters/pds/dropbox')
jest.mock('dropbox-fs', () => () => ({
  readFile: jest.fn((path, encoding, callback) => {
    callback(null, 'brÃ¶k')
  })
}))

describe('adapters/pds/dropbox', () => {
  describe('#getFs', () => {
    let fs
    beforeEach(() => {
      fs = dropbox.getFs({ access_token: 'derp' })
    })
    describe('#readFile', () => {
      xit('fixes utf-8 error', (done) => {
        fs.readFile('/data/derp.txt', 'utf8', (_, res) => {
          expect(res).toEqual('brök')
          done()
        })
      })
    })
  })
})
