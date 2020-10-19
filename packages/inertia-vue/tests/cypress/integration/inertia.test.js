describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('.text').should('have.text', 'Hello World!')
  })
})
