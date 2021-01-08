describe('Remember (local state caching)', () => {
  it('does not remember anything as of default', () => {
    cy.visit('/remember/nothing')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/nothing')

    cy.get('#name').type('Inertia')
    cy.get('#remember').check()
    cy.get('#untracked').type('Example')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/nothing')

    cy.get('#name').should('not.have.value', 'Inertia')
    cy.get('#remember').should('not.be.checked')
    cy.get('#untracked').should('not.have.value', 'Example')
  })

  it('remembers tracked fields using the array syntax', () => {
    cy.visit('/remember/array')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/array')

    cy.get('#name').type('Inertia')
    cy.get('#remember').check()
    cy.get('#untracked').type('Example')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/array')

    cy.get('#name').should('have.value', 'Inertia')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'Example')
  })

  it('remembers tracked fields using the object syntax', () => {
    cy.visit('/remember/object')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/object')

    cy.get('#name').type('Inertia')
    cy.get('#remember').check()
    cy.get('#untracked').type('Example')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/object')

    cy.get('#name').should('have.value', 'Inertia')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'Example')
  })

  it('remembers tracked fields using the string syntax', () => {
    cy.visit('/remember/string')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/string')

    cy.get('#name').type('Inertia')
    cy.get('#remember').check()
    cy.get('#untracked').type('Example')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/string')

    cy.get('#name').should('have.value', 'Inertia')
    cy.get('#remember').should('not.be.checked')
    cy.get('#untracked').should('not.have.value', 'Example')
  })

  it('restores remembered data when pressing the back button', () => {
    cy.visit('/remember/multiple-components')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').type('Inertia')
    cy.get('#remember').check()
    cy.get('#untracked').type('Example')
    cy.get('.a-name').type('Inertia A')
    cy.get('.a-untracked').type('Example A')
    cy.get('.b-name').type('Inertia B')
    cy.get('.b-remember').check()
    cy.get('.b-untracked').type('Example B')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').should('have.value', 'Inertia')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'Example')
    // Component "A" uses a string-style key (key: 'Users/Create')
    cy.get('.a-name').should('have.value', 'Inertia A')
    cy.get('.a-remember').should('not.be.checked')
    cy.get('.a-untracked').should('not.have.value', 'Example')
    // Component "B" uses a callback-style key (key: () => `Users/Edit:${this.user.id}`)
    cy.get('.b-name').should('have.value', 'Inertia B')
    cy.get('.b-remember').should('be.checked')
    cy.get('.b-untracked').should('not.have.value', 'Example')
  })

  it('restores remembered data when pressing the back button from another website', { retries: 10 }, () => {
    cy.visit('/remember/multiple-components')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').type('Inertia')
    cy.get('#remember').check()
    cy.get('#untracked').type('Example')
    cy.get('.a-name').type('Inertia A')
    cy.get('.a-untracked').type('Example A')
    cy.get('.b-name').type('Inertia B')
    cy.get('.b-remember').check()
    cy.get('.b-untracked').type('Example B')

    cy.get('.off-site').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/non-inertia')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').should('have.value', 'Inertia')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'Example')
    // Component "A" uses a string-style key (key: 'Users/Create')
    cy.get('.a-name').should('have.value', 'Inertia A')
    cy.get('.a-remember').should('not.be.checked')
    cy.get('.a-untracked').should('not.have.value', 'Example')
    // Component "B" uses a callback-style key (key: () => `Users/Edit:${this.user.id}`)
    cy.get('.b-name').should('have.value', 'Inertia B')
    cy.get('.b-remember').should('be.checked')
    cy.get('.b-untracked').should('not.have.value', 'Example')
  })
})
