describe('Health route for example/cv', () => {
  it('Shows health ok', () => {
    cy.request('/health').then(response => {
      expect(response.body.status.operator).to.eq('OK')
      expect(response.body.status.redis).to.eq('OK')
    })
  })
})
