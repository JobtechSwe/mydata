const v4Regexp = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i

describe('Consent request for example/cv', () => {
  beforeEach(() => {
    cy.clearAccount()

    cy.window().then(win => {
      win.sessionStorage.clear()
    })
  })
  it('Loads auth page and displays consent request id', () => {
    cy
      .visit('/')

    cy
      .get('button')
      .contains('Log in')
      .click()

    cy
      .url()
      .should('include', '/auth')

    cy
      .get('#qr-code')
      .should(res => {
        expect(res[0].getAttribute('data-consent-request-id')).to.match(v4Regexp)
      })

    cy.visit('/')
  })

  it('Profile page is loaded when consent is approved', () => {
    cy
      .createAccount({ firstName: 'Johan', lastName: 'Öbrink' })

    cy
      .visit('/')

    cy
      .get('button')
      .contains('Log in')
      .click()

    cy
      .get('#qr-code')
      .then(res => {
        const id = res[0].getAttribute('data-consent-request-id')
        return cy.getConsentRequest(id)
      })
      .then(consentReq => {
        return cy.approveConsentRequest(consentReq)
      })

    cy
      .url()
      .should('include', '/profile')
  })
})