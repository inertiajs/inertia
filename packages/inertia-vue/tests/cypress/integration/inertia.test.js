describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('.text').should('have.text', 'This is the Test App Entrypoint page')
  })
})
