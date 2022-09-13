describe('Error Modal', () => {
  beforeEach(() => {
    cy.visit('/error-modal', {
      onLoad: () =>
        cy.on('window:load', () => {
          alert('A location/non-SPA visit was detected')
        }),
    })
  })

  it('displays the modal containing the response as HTML when an invalid Inertia response comes back', () => {
    cy.get('.invalid-visit').click()

    cy.get('iframe').should('exist')
    cy.get('iframe').should('have.length', 1)
    cy.get('iframe')
      .its('0.contentDocument')
      .should('have.text', 'This is a page that does not have the Inertia app loaded.')
  })

  it('displays the modal with a helpful message when a regular JSON response comes back instead of an Inertia response', () => {
    cy.get('.invalid-visit-json').click()

    cy.get('iframe').should('exist')
    cy.get('iframe').should('have.length', 1)
    cy.get('iframe')
      .its('0.contentDocument')
      .should(
        'contain.text',
        'All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.',
      )
    cy.get('iframe').its('0.contentDocument').should('contain.text', '{"foo":"bar"}')
  })

  it('can close the modal using the escape key', () => {
    cy.get('.invalid-visit').click()
    cy.get('iframe').should('exist')
    cy.get('body').type('{esc}')
    cy.get('iframe').should('not.exist')
  })
})
