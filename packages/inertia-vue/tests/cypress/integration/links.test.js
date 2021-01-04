describe('Links', () => {
  it('visits a different inertia page using the inertia-link component', () => {
    cy.visit('/links')

    // Fail the assertion when a hard visit / location visit is made.
    // Inertia's SPA-visit should not trigger this.
    cy.on('load', () => expect(true).to.equal(false))

    cy.get('[href="/links-target-1"]').click()

    cy.url().should('eq', Cypress.config().baseUrl + '/links-target-1')
    cy.get('body > div:first-child > span').should(($el) => {
      expect($el.get(0).innerText).to.eq('This is one of the links target page')
    })
  })
})
