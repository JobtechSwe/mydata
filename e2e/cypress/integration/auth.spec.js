const v4Regexp = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i

describe('Auth flow for example/cv', () => {
  beforeEach(() => {
    cy.clearStorage()

    cy.window().then(win => {
      win.sessionStorage.clear()
    })
  })
  it('Loads auth page and displays authentication code', () => {
    cy.visit('/')

    cy.get('button')
      .contains('Login')
      .click()

    cy.url()
      .should('include', '/auth')

    cy.get('#qrcode')
      .should(res => {
        expect(res[0].getAttribute('data-consent-request-id')).to.match(v4Regexp)
      })
  })

  it('Auth flow for new connection', () => {
    cy.createAccount({ firstName: 'Johan', lastName: 'Öbrink' })

    cy.visit('/')

    cy.get('button')
      .contains('Login')
      .click()

    cy.get('#qrcode')
      .then(res => {
        const url = res[0].getAttribute('data-consent-request-url')
        return cy.handleAuthCode({ code: url })
          .then(({ connectionRequest }) => cy.approveConnection(connectionRequest))
      })

    cy.getConnections()
      .then(res => {
        expect(res[0].serviceId).to.match(/^http/)
        expect(res[0].connectionId).to.be.a('string')
      })

    cy.url()
      .should('include', '/profile')
  })

  it('Auth flow for existing connection', () => {
    cy.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    cy.visit('/')

    cy.get('button')
      .contains('Login')
      .click()

    cy.get('#qrcode')
      .then(res => {
        const url = res[0].getAttribute('data-consent-request-url')
        return cy.handleAuthCode({ code: url })
          .then(({ connectionRequest }) => cy.approveConnection(connectionRequest))
      })

    cy.getConnections()
      .then(res => {
        expect(res[0].serviceId).to.match(/^http/)
        expect(res[0].connectionId).to.be.a('string')
      })

    cy.url()
      .should('include', '/profile')

    cy.window().then(win => {
      win.sessionStorage.clear()
    })

    // Now, try to login again
    cy.visit('/')

    cy.get('button')
      .contains('Login')
      .click()

    cy.get('#qrcode')
      .then(res => {
        const url = res[0].getAttribute('data-consent-request-url')
        return cy.handleAuthCode({ code: url })
          .then(({ existingConnection, sessionId }) => cy.approveLogin({ connection: existingConnection, sessionId }))
      })

    cy.url()
      .should('include', '/profile')
  })
})
