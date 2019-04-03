import { parse } from '../qrcode'

describe('qrcode', () => {
  describe('#parse', () => {
    it('parses register code correctly', () => {
      const { type, code } = parse('mydata://register/bd22f2c5-d17d-43c7-94ae-e567922bc07c')
      expect(type).toEqual('register')
      expect(code).toEqual('bd22f2c5-d17d-43c7-94ae-e567922bc07c')
    })
    it('parses login code correctly', () => {
      const { type, code } = parse('mydata://login/eyJzZXNzaW9uSWQiOiJzZXNzaW9uX2JiNmEyMTIyLWQxOWEtNGE4Ny1hY2E0LWViZjE4N2RlMGIwOSIsImNsaWVudElkIjoiaHR0cDovL2N2OjQwMDAifQ')
      expect(type).toEqual('login')
      expect(code).toEqual('eyJzZXNzaW9uSWQiOiJzZXNzaW9uX2JiNmEyMTIyLWQxOWEtNGE4Ny1hY2E0LWViZjE4N2RlMGIwOSIsImNsaWVudElkIjoiaHR0cDovL2N2OjQwMDAifQ')
    })
  })
})
