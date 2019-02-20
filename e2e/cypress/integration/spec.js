const v4Regexp = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i

describe('Create account', () => {
  it('Creates an account', () => {
    cy
      .setConfig({ OPERATOR_URL: 'http://localhost:3000/api' })
      .then(config => console.log(config))

    cy
      .createAccount({ firstName: 'Johan', lastName: 'Öbrink' })
      .then(account => console.log(account))
  })
})

describe('Consent request for example/cv', () => {
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
      .get('[data-cy="consent-request-id"]')
      .should(res => {
        expect(res[0].innerHTML).to.match(v4Regexp)
      })

    cy.visit('/')
  })
})