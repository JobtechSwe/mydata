import { createAccountToken } from '../jwt'
jest.mock('react-native-config', () => ({
    OPERATOR_URL: 'https://smooth-operator.work',
}))

const privatePem = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA4aOc6ck9Wh0+PfG4gCsMSaZT9nE+NXxQ8iSbocelFf+ViJE4
vCcEk/1iU4+bEahtem6mBSN+rCUHACg0fWH1GzTmpmUTZFsbLXAWkMuJk+FXAy5d
fXPFUQhE6cZbcrqYke5T5tbXExnu39OR/F+c6hvXahPsfDpIPF9BJ7GA6c3brMCh
1jTYiuk5xAmOLobsC/McgsEhWgHEwv1f85fs5Sn0CHi6OGISpntG0TA7oAnnktfA
xIb+f3ZnaHfPBq6z4/jJjXt0wM/4sxqjvzirI6Wewk0jxQsCsEhE4v251OHectui
HWnG48xpxqHrKEa9LE79x4a2XBLt3RV2NNLpRwIDAQABAoIBAAxMUp0bbtCej2no
5tl1fzH0ctcXzQA1SmQoQqNKsmDEkW3kHGeE6Ob4BIfxZ85Kk8z8guf8y0aurfcA
OfwrfqSA+aFQGQJ7RLvxRAmYTmNVAN0Xhdj0mmiUPs1PFmTmbrJlfwUx6H8OBssE
SQysWW0ZH2CUvWr38j/4ISD8t74GdCJbrKA7R0txaNbSyZCD/9j/MGEPqq6KGMPb
OrAPWY8sNRbAypEPhqi5tsViw6eI2fJR92X4KYNgrlyf8fSh5V85ZESviwcXkW3C
8RUcN+hi+CYpIMsnqjaB4Rd7pZASKIfmG8ANOmMDLUbOpuZJX88pbRwqS2Rtx447
9aeJFaECgYEA9S4smD5aWbbh5gtYxY6yrp0dglwCFBJcgzLS1OWn5PMYBZZlQDPU
0pVTpE6GECXqBv3sYA0N3gG2hXL17dx+8aDFnlO/sCOMFf/ddxbkg+yDwlKlNmBN
OX5JesFoWBztOJUcaOdnXDJJi1VM70GH/VtXP5UsuDyMBLiRYD/sC3UCgYEA65it
6TSrzS6RMnNXmajj+yPLeE5N1YHI2oHVN/hKgQcoRfSqLDJFB0maVy38XunkJJU2
XP6ZjuTLgvntxVDl8J+Y+XtlNoWSZZ1s2F8iMuz20lJS3Cw70xK9vkeog5D86xgK
EhGIHmu8waISWm/Bdz/SdLGtclFTBhiCqQ6BlksCgYEA4Fx0qozEmTxl0+GmRoKi
uG9GRbh0nnF+/wBPNktCLJzX6qUJ2oqTwnCrrbu9qqFHW0aaO/s2KWZf5BajPht8
fxikPpJc445j7u3Jd+UXEDIrEHQYg330rRwHmbHLDnbKDfFFoim/x/qsmjhgwsCw
9QPU/3Y/Cgk+CEPtpKpaEtECgYEAtPGYcEnRwU6ImbTYjN2X62R8ezO4t8hsGNYq
ikgaAKsclU3p/PPG7GftMBPThpogbLBlBltMWOEEJN4LbcZKM9p/xOyuuYcw/vY/
iJbYT0CL+NDdbthSQjRcom2q0RFkDrNx2Jq6bpLUb+soKWk3r3zHCHUF/4zSNRZS
E8Feaa0CgYBLkLeNvUqdvf5oq1lmbLL0lNfgQU4VwsAF0Cyg8HPt3mTXgAA29sgN
CBwEuU85YlBWpDdvdbsYv9Pa4uhn0FNJvbM42vKQH//cgxHDMLHTLmqG7DnTIgTy
pRPSlnhfkr82agPZ22QN9mMUHT173+S0kEOwvrk6pDArArUEVBTXKg==
-----END RSA PRIVATE KEY-----`

const publicPem = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA4aOc6ck9Wh0+PfG4gCsMSaZT9nE+NXxQ8iSbocelFf+ViJE4vCcE
k/1iU4+bEahtem6mBSN+rCUHACg0fWH1GzTmpmUTZFsbLXAWkMuJk+FXAy5dfXPF
UQhE6cZbcrqYke5T5tbXExnu39OR/F+c6hvXahPsfDpIPF9BJ7GA6c3brMCh1jTY
iuk5xAmOLobsC/McgsEhWgHEwv1f85fs5Sn0CHi6OGISpntG0TA7oAnnktfAxIb+
f3ZnaHfPBq6z4/jJjXt0wM/4sxqjvzirI6Wewk0jxQsCsEhE4v251OHectuiHWnG
48xpxqHrKEa9LE79x4a2XBLt3RV2NNLpRwIDAQAB
-----END RSA PUBLIC KEY-----`

describe('services/jwt', () => {
  describe('#createAccountToken', () => {
    it('does not throw', async () => {
      const account = {
        firstName: 'Fredrik',
        lastName: 'Laxman',
        keys: {
          privateKey: privatePem,
          publicKey: publicPem,
        },
        pds: {
          access_token: 'asasd',
          provider: 'memory',
        },
      }

      await createAccountToken(account)
      expect(true).toBe(true)
    })
  })
})
