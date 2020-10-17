describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('body > div:first-child').should(($el) => {
      expect($el.get(0).innerHTML.trim()).to.eq('Hello World!')
    })
  })
})
