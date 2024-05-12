describe('Remember (local state caching)', () => {
  it('does not remember anything as of default', () => {
    cy.visit('/remember/default')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/default')

    cy.get('#name').clear().type('A')
    cy.get('#remember').check()
    cy.get('#untracked').clear().type('B')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/default')

    cy.get('#name').should('not.have.value', 'A')
    cy.get('#remember').should('not.be.checked')
    cy.get('#untracked').should('not.have.value', 'B')
  })

  it('remembers tracked fields using the array syntax', () => {
    cy.visit('/remember/array')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/array')

    cy.get('#name').clear().type('A')
    cy.get('#remember').check()
    cy.get('#untracked').clear().type('B')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/array')

    cy.get('#name').should('have.value', 'A')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'B')
  })

  it('remembers tracked fields using the object syntax', () => {
    cy.visit('/remember/object')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/object')

    cy.get('#name').clear().type('A')
    cy.get('#remember').check()
    cy.get('#untracked').clear().type('B')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/object')

    cy.get('#name').should('have.value', 'A')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'B')
  })

  it('remembers tracked fields using the string syntax', () => {
    cy.visit('/remember/string')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/string')

    cy.get('#name').clear().type('A')
    cy.get('#remember').check()
    cy.get('#untracked').clear().type('B')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/string')

    cy.get('#name').should('have.value', 'A')
    cy.get('#remember').should('not.be.checked')
    cy.get('#untracked').should('not.have.value', 'B')
  })

  it('restores remembered data when pressing the back button', () => {
    cy.visit('/remember/multiple-components')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').clear().type('D')
    cy.get('#remember').check()
    cy.get('#untracked').clear().type('C')
    cy.get('.a-name').clear().type('A1')
    cy.get('.a-untracked').clear().type('A2')
    cy.get('.b-name').clear().type('B1')
    cy.get('.b-remember').check()
    cy.get('.b-untracked').clear().type('B2')

    cy.get('.link').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').should('have.value', 'D')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'C')
    // Component "A" uses a string-style key (key: 'Users/Create')
    cy.get('.a-name').should('have.value', 'A1')
    cy.get('.a-remember').should('not.be.checked')
    cy.get('.a-untracked').should('not.have.value', 'C')
    // Component "B" uses a callback-style key (key: () => `Users/Edit:${this.user.id}`)
    cy.get('.b-name').should('have.value', 'B1')
    cy.get('.b-remember').should('be.checked')
    cy.get('.b-untracked').should('not.have.value', 'C')
  })

  it.skip('restores remembered data when pressing the back button from another website', { retries: 10 }, () => {
    cy.visit('/remember/multiple-components')
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').clear().type('D')
    cy.get('#remember').check()
    cy.get('#untracked').clear().type('C')
    cy.get('.a-name').clear().type('A1')
    cy.get('.a-untracked').clear().type('A2')
    cy.get('.b-name').clear().type('B1')
    cy.get('.b-remember').check()
    cy.get('.b-untracked').clear().type('B2')

    cy.get('.off-site').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/non-inertia')

    cy.go(-1)
    cy.url().should('eq', Cypress.config().baseUrl + '/remember/multiple-components')

    cy.get('#name').should('have.value', 'D')
    cy.get('#remember').should('be.checked')
    cy.get('#untracked').should('not.have.value', 'C') // Somehow this fails often on my Cypress install, so we'll just re-try the test 10 times.
    // Component "A" uses a string-style key (key: 'Users/Create')
    cy.get('.a-name').should('have.value', 'A1')
    cy.get('.a-remember').should('not.be.checked')
    cy.get('.a-untracked').should('not.have.value', 'C')
    // Component "B" uses a callback-style key (key: () => `Users/Edit:${this.user.id}`)
    cy.get('.b-name').should('have.value', 'B1')
    cy.get('.b-remember').should('be.checked')
    cy.get('.b-untracked').should('not.have.value', 'C')
  })

  describe('form helper', () => {
    it('does not remember form data as of default', () => {
      cy.visit('/remember/form-helper/default')
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/default')

      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()
      cy.get('#untracked').clear().type('C')

      cy.get('.link').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/default')

      cy.get('#name').should('not.have.value', 'A')
      cy.get('#handle').should('not.have.value', 'B')
      cy.get('#remember').should('not.be.checked')
      cy.get('#untracked').should('not.have.value', 'C')
    })

    it('does not remember form errors as of default', () => {
      cy.visit('/remember/form-helper/default')
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/default')

      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()
      cy.get('#untracked').type('C')
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')

      cy.get('.submit').click()
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')

      cy.get('.link').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/default')

      cy.get('#name').should('not.have.value', 'A')
      cy.get('#handle').should('not.have.value', 'B')
      cy.get('#remember').should('not.be.checked')
      cy.get('#untracked').should('not.have.value', 'C')
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')
    })

    it('remembers form data when tracked', () => {
      cy.visit('/remember/form-helper/remember')
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/remember')

      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()
      cy.get('#untracked').type('C')

      cy.get('.link').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/remember')

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')
      cy.get('#untracked').should('not.have.value', 'C')
    })

    it('remembers form errors when tracked', () => {
      cy.visit('/remember/form-helper/remember')
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/remember')

      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()
      cy.get('#untracked').type('C')
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')

      cy.get('.submit').click()
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')

      cy.get('.link').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/remember')

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')
      cy.get('#untracked').should('not.have.value', 'C')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')
    })

    it('remembers the last state of a form when tracked', () => {
      cy.visit('/remember/form-helper/remember')
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/remember')

      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()
      cy.get('#untracked').type('C')
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')

      cy.get('.submit').click()
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')
      cy.get('#untracked').should('have.value', 'C') // Only due to visit POST/PUT/PATCH/DELETE method's default preserveState option.
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')

      cy.get('.reset-one').click()
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'example')
      cy.get('#remember').should('be.checked')
      cy.get('#untracked').should('have.value', 'C') // Unchanged from above
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')

      cy.get('.link').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/remember/form-helper/remember')

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'example')
      cy.get('#remember').should('be.checked')
      cy.get('#untracked').should('not.have.value', 'C') // Untracked, so now reset (page state was lost)
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')
    })
  })
})
