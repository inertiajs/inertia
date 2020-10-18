describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('body > div:first-child').should('have.text', 'Hello World!')
  })
})
