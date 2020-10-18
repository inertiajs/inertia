describe('Links', () => {
  it('visits a different inertia page using the inertia-link component', () => {
    cy.visit('/links')

    // Fail the assertion when a hard visit / location visit is made.
    // Inertia's SPA-visit should not trigger this.
    cy.on('load', () => expect(true).to.equal(false))

    cy.get('[href="/links-target"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/links-target')

    cy
      .get('body > div:first-child > span')
      .should('have.text', 'This is one of the links target page')
  })
})
