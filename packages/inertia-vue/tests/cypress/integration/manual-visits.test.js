describe('Manual Visits', () => {
  it('visits a different page', () => {
    cy.visit('/', {
      onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
    })

    cy.get('.visits-method').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/visits/method')

    cy.get('.text').should('have.text', 'This is the page that demonstrates manual visit methods')
  })

  describe('Method', () => {
    beforeEach(() => {
      cy.visit('/visits/method', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
    })

    it('can use the visit method', () => {
      cy.get('.visit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('get')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the GET method', () => {
      cy.get('.get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('get')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the POST method', () => {
      cy.get('.post').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('post')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the PUT method', () => {
      cy.get('.put').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('put')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the PATCH method', () => {
      cy.get('.patch').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('patch')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the DELETE method', () => {
      cy.get('.delete').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('delete')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })
  })
})
