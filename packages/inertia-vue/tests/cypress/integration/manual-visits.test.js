describe('Manual Visits', () => {
  it('visits a different page', () => {
    cy.visit('/', {
      onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
    })

    cy.get('.visits-method').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/visits/method')

    cy.get('.text').should('have.text', 'This is the page that demonstrates manual visit methods')
  })
})
