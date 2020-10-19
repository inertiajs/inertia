describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('.hello').should('have.text', 'Hello World!')
  })
})
