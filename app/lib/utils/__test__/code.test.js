import { parse } from '../code'

describe('code', () => {
  describe('#parse', () => {
    it('parses auth url correctly', () => {
      const jwt = parse('mydata://account/stuff-here-thing')
      expect(jwt).toEqual('stuff-here-thing')
    })
  })
})
