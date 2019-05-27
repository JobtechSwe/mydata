import { initRegistration } from '../auth'
import { getAccount } from '../account'
import { verify, decode } from 'jwt-lite'
import axios from 'axios'

// const foo = require('@egendata/messaging')
jest.mock('../account', () => ({
  getAccount: jest.fn(),
}))

jest.useFakeTimers()

// TODO: Verify that generate key actually creates something like this (and not appends \n or something...)
const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA6RZ4jj7HvC/v74ZgHRLPkcJE65FE82AmX6SX7fX+KKkk/33NOIHP
ZK0Iek4AO0lP5eGwv/L2EL80DfWrJ1aBNwH0uTx6pJq4WhrqE2hZRfxqYlA6sfU9
KR9jY0hRN82jAnAAUoDIn9k+r3GMbKibC+fyvqZNo7XOGjG85Vu5jAGKBlVnl7Jz
pGi5Xb2Ns6EwvBt+yV8uyacz/7Sn5ne44+/dLbKCe2kIfjUMFpMlbiO20ANQoG4t
0KWudZPyLGTyRi9TW0AWoC5MjEJsYj35ri3skHs4Tyd5CPnJCp6v8dYq1m/letWb
K0rQYzODsABSYX7fsSgX2MwzEkVpQByBawIDAQAB
-----END RSA PUBLIC KEY-----`

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA2GGPe+sE9LolxEHfkmQkFClbU6CPk2Q88Q0Q95RFDc64ju3/
iOVi59dFw6pcG6O3Lbt3M68Zkp1QzNu8h3oDDC2P+b1Bf8C+13qlvCZIVdqFaxVh
Jj5f0zHAMOewRmcNsAw3XEsm5Orm4fLPM821tquJClUKV7va7VsOYyBzPWcA0Vsj
OxuGpbaa2Y1VraccmgzcFAK+L9o5wj57bQrSgYZyPMMhvTf/1WDeKqUBFPrYUpZ8
XbfgWsqCjsvjgal1Og7hEIZUBj0XWoR+3W6PSNxgyTfyogzIfq3Vypjzem/KO5mz
OWgp94hdgHnLicrPTH4XsFiizlvtMeW/lORROQIDAQABAoIBAAr1TeXxrguSzczV
pTPtvGIFAioHDJ5jSi7PAZf4O1MKsBAU/4b4Tvz8yvywyP9hWCqJvuywJnRlYS0u
x6p4xGS+ffcg3YtRwJh7Dp+rtKgca/tTVtsv93xjnZ8cbLH0EB5lT/xtleer+cth
l5rBBT3eDA+o5OAylFDG9sCQaSWn1ODztfLM20BbAfWooEsCk6GfEN3f4y8e456n
BQCi+7NXZ5ryzz8LvL8prqeyabI/zPcD0X2z96Gp/yuWY6Qz8sLDAbDqQEx2YAgL
bVw4rD8xOjFU5dWlxWHe+JB/9i99Pl55Va0SsLHliRQzXYvQVaChZQG5gly8C39V
blUuif0CgYEA+p7ncJ3cORjnBQkEBJbM6bYT9ElYBbT6FxZe516OLASFL9C1bbpj
zt53qe8URKCy8YZ8nnduI9pY02cTRUg6vA57CKQcY8+IK8h4lDZBwmOJckH6q4nV
OlaelUPouNgriBI8q3MCiFfVcsirAvRlRT+N8E3/MkNzqymJRYQ5disCgYEA3QaE
wGGjuXDehkJ9562noMmxmR843qjXIYy9b4XPinbnRSvs1H6gX/IEwQu9DnijmDbe
NHpsMDpIbnlIhzGFBGVd+PqmKWPuWF7zNAhH/eKCuUOqQH8QXr+E2CFzeTrgicL0
lSA6JaDCztESmg8yXe8WIW+Tg1gLzDkw7FO0aCsCgYEAlyH2TXpU0HXM8sNiEeZi
gdmUJO+Jzj85xWxvJLVnpPHA43nHvvj0sU6E+Qw8u7nwzyebxPAeki5c/HcfLtuE
190forFckXAYHNcSp8YkV7Ywr59MK9+9nyWXEkpWcAmkDrV4sqdzcocNJ+ANCIYa
/+x4it5uM4Bro18z8aDwCesCgYEAwEjmftOy8yZ9gQIhtMd/uMMfbZ4bBKKQnlBp
kbcw6j4tTyE6pVcQQMg1WJjUvd04PbkmMTN8IazizLFY5ryvAzcIvQ2aNxIIDft0
y4SU1QwVPAXg/MFORY+Ki9j2M7aEF3VzALWLwKaONAzxiPPFlrDkaOw/whl8EgyD
QmZD4gcCgYEAnEEnjwdjVtRflPpaONp6/hV47pQpsKLp4v0pSy0ykbkTC9XLR+M1
mhf8D9ubrGfl2IjwBDff7HXiW4v8VdEAPyKT79NyzBWj0OdImz2Q1jVystQzYS0b
6jM/XpXOUVmeJJhrUSdklVYuAexhaLxuMhjSzLyifq5lctiO8evUlJk=
-----END RSA PRIVATE KEY-----`

describe('auth', () => {
  let account

  beforeAll(async () => {
    account = { id: 'foo', keys: { privateKey, publicKey } }

    getAccount.mockResolvedValue(account)
  })

  describe('#initRegistration', () => {
    it('posts to correct url with correct content type', async () => {
      const authRequest = {
        aud: 'mydata://account',
        description: 'An app for your CV online',
        events: 'http://localhost:4000/events',
        exp: 1556946770839,
        iss: 'http://localhost:4000',
        sid: '5e6f8512-b2c1-48f9-adda-17026cd84856',
        name: 'My CV',
        type: 'AUTHENTICATION_REQUEST',
      }

      await initRegistration(authRequest)

      expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/events', expect.any(String), { headers: { 'content-type': 'application/jwt' } })
    })

    it.skip('sends signed jwt', async () => {
      const authRequest = {
        aud: 'mydata://account',
        description: 'An app for your CV online',
        events: 'http://localhost:4000/events',
        exp: 1556946770839,
        iss: 'http://localhost:4000',
        jti: '8228a45c-736e-483f-927a-b81f01081740',
        name: 'My CV',
        type: 'AUTHENTICATION_REQUEST',
      }

      await initRegistration(authRequest)
      const jwt = axios.post.mock.calls[0][1]

      const { header } = decode(jwt)
      const res = await verify(jwt, header.jwk)
      expect(res).toEqual({})
    })
  })
})
