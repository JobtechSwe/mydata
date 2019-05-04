import { handleJwt, createConnectionInfoRequest } from '../auth'

jest.mock('../getKey', () => ({
  getKey: () => {
    return {
      alg: 'RS256',
      e: 'AQAB',
      ext: true,
      key_ops: [
        'verify',
      ],
      kty: 'RSA',
      n: 'p0V6QDPjsjB2CddNxzjUVXKpGAODmqjS0QPMGSDXD_bR_kTyA2zwt2bKOyIyuOvmy8kp7En7hEebopKH9codgGnlZBV47xeyk24NaqI9ZTelrXjXOBjhNF13vTCaVTEI4a9-YFZhi_y07I-QJRU1k6c8vWLEQ6HljboX7YCtN6T1tUzu9-ZZ7qwbHZhZHN4YbbGQfmXJMflzzJ6FnT1qKmtt9zwrMgqhm_KXVuGq9G1LzWFo06nCZD3xJSwFT5d8qbG9gC3jHFaGF_1Vr3ywMAzkO2xGuOuuG0Rq1Nbl_n0yFCgBzYG6q7wEnMc1FUTfOBwj0Cj9CmT_VGSfTPjDoQ',
      kid: 'http://localhost:4000/jwks/client_key',
      use: 'sig',
    }
  },
}))

describe('auth', () => {
  describe('#handleJwt', () => {
    it('runs', async () => {
      const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMC9qd2tzL2NsaWVudF9rZXkifQ.eyJ0eXBlIjoiQVVUSEVOVElDQVRJT05fUkVRVUVTVCIsIm5hbWUiOiJNeSBDViIsImRlc2NyaXB0aW9uIjoiQW4gYXBwIGZvciB5b3VyIENWIG9ubGluZSIsImV2ZW50cyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMC9ldmVudHMiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQwMDAiLCJhdWQiOiJteWRhdGE6Ly9hdXRoIiwiZXhwIjoxNTU2OTQ2NzcwODM5LCJqdGkiOiI4MjI4YTQ1Yy03MzZlLTQ4M2YtOTI3YS1iODFmMDEwODE3NDAifQ.RrJ1IOToWADw3dx9OZPA1ILnPD1tt195UcLn5ADpaMqKK5qzvz9I_6NqXHfKlozEeRABNAOR5TSVXJv5_CN1PBAxAiucDD8Gez7fOXrxS8vFek5Au6nsqpzTD61pmMmw_wvWPFLhvt_sk46k49oIdnmltqsLm-FKzb7VBmdyd6R_B_Vd9ByTXYr8-2JOQz269zXLoYeV5txTObKlQd_LrGCx9dz3_1N1duMYCcNtknT2mBVbDHWVIKblP6uOyzfDT5LBG9hcCcwJtwSMfwZD6sBp6UpvqLYImCcaat5kBPtyDTdZJEoxcSdIoSWLziAgis1TMeP5mspV3X0Z-JXycA'
      const res = await handleJwt(jwt)
      expect(res).toEqual({
        aud: 'mydata://auth',
        description: 'An app for your CV online',
        events: 'http://localhost:4000/events',
        exp: 1556946770839,
        iss: 'http://localhost:4000',
        jti: '8228a45c-736e-483f-927a-b81f01081740',
        name: 'My CV',
        type: 'AUTHENTICATION_REQUEST',
      })
    })
  })

  describe('#createConnectionInfoRequest', () => {
    it('runs', () => {
      const res = createConnectionInfoRequest({
        aud: 'mydata://auth',
        description: 'An app for your CV online',
        events: 'http://localhost:4000/events',
        exp: 1556946770839,
        iss: 'http://localhost:4000',
        jti: '8228a45c-736e-483f-927a-b81f01081740',
        name: 'My CV',
        type: 'AUTHENTICATION_REQUEST',
      })
      expect(res).toBe('eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJ0eXBlIjoiQ09OTkVDVElPTl9JTkZPX1JFUVVFU1QiLCJhdWQiOiJteWRhdGE6Ly9hdXRoIn0.')
    })
  })
})
