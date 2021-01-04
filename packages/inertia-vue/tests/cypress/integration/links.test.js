describe('Links', () => {
  it('visits a different page', () => {
    cy.visit('/links/basic')

    // Fail the assertion when a hard visit / location visit is made.
    // Inertia's SPA-visit should not trigger this.
    cy.on('load', () => expect(true).to.equal(false))

    cy.get('.basic').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/links-target/get')

    cy.get('.text').should('have.text', 'This is one of the links target page')
  })

  describe('Methods', () => {
    it('can use the GET method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/links-target/get')

      cy.get('.method').should('have.text', 'Method: get')
      cy.get('.query').should('have.text', 'QueryParams: {}')
      cy.get('.form').should('have.text', 'FormData: {}')
    })

    it('can use the POST method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.post').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/links-target/post')

      cy.get('.method').should('have.text', 'Method: post')
      cy.get('.query').should('have.text', 'QueryParams: {}')
      cy.get('.form').should('have.text', 'FormData: {}')
    })

    it('can use the PUT method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.put').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/links-target/put')

      cy.get('.method').should('have.text', 'Method: put')
      cy.get('.query').should('have.text', 'QueryParams: {}')
      cy.get('.form').should('have.text', 'FormData: {}')
    })

    it('can use the PATCH method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.patch').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/links-target/patch')

      cy.get('.method').should('have.text', 'Method: patch')
      cy.get('.query').should('have.text', 'QueryParams: {}')
      cy.get('.form').should('have.text', 'FormData: {}')
    })

    it('can use the DELETE method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.delete').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/links-target/delete')

      cy.get('.method').should('have.text', 'Method: delete')
      cy.get('.query').should('have.text', 'QueryParams: {}')
      cy.get('.form').should('have.text', 'FormData: {}')
    })
  })

  describe('Data', () => {
    describe('plain objects', () => {
      it('passes data as params using the GET method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/get')

        cy.get('.content-type').should('contain.text', 'Content-Type: application/json')
        cy.get('.method').should('have.text', 'Method: get')
        cy.get('.form').should('have.text', 'FormData: {}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {\n  "foo": "get"\n}')
      })

      it('can pass data using the POST method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/post')

        cy.get('.content-type').should('contain.text', 'Content-Type: application/json')
        cy.get('.method').should('have.text', 'Method: post')
        cy.get('.form').should('have.text', 'FormData: {\n  "bar": "post"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })

      it('can pass data using the PUT method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/put')

        cy.get('.content-type').should('contain.text', 'Content-Type: application/json')
        cy.get('.method').should('have.text', 'Method: put')
        cy.get('.form').should('have.text', 'FormData: {\n  "baz": "put"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })

      it('can pass data using the PATCH method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/patch')

        cy.get('.content-type').should('contain.text', 'Content-Type: application/json')
        cy.get('.method').should('have.text', 'Method: patch')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "patch"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })

      it('can pass data using the DELETE method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/delete')

        cy.get('.content-type').should('contain.text', 'Content-Type: application/json')
        cy.get('.method').should('have.text', 'Method: delete')
        cy.get('.form').should('have.text', 'FormData: {\n  "bar": "delete"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })
    })

    describe('FormData objects', () => {
      it('can pass data using the POST method', () => {
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/post')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.method').should('have.text', 'Method: post')
        cy.get('.form').should('have.text', 'FormData: {\n  "bar": "baz"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })

      it('can pass data using the PUT method', () => {
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/put')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.method').should('have.text', 'Method: put')
        cy.get('.form').should('have.text', 'FormData: {\n  "bar": "baz"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })

      it('can pass data using the PATCH method', () => {
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/patch')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.method').should('have.text', 'Method: patch')
        cy.get('.form').should('have.text', 'FormData: {\n  "bar": "baz"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })

      it('can pass data using the DELETE method', () => {
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/delete')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.method').should('have.text', 'Method: delete')
        cy.get('.form').should('have.text', 'FormData: {\n  "bar": "baz"\n}')
        cy.get('.files').should('have.text', 'Files: 0')
        cy.get('.query').should('have.text', 'QueryParams: {}')
      })
    })

    describe('auto-converted objects (when files are present)', () => {
      it('auto-converts objects to form-data when files are present using the POST method', () => {
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/post')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.method').should('have.text', 'Method: post')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.query').should('have.text', 'QueryParams: {}')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "bar"\n}')
      })

      it('auto-converts objects to form-data when files are present using the PUT method', () => {
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/put')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.method').should('have.text', 'Method: put')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.query').should('have.text', 'QueryParams: {}')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "bar"\n}')
      })

      it('auto-converts objects to form-data when files are present using the PATCH method', () => {
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/patch')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.method').should('have.text', 'Method: patch')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.query').should('have.text', 'QueryParams: {}')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "bar"\n}')
      })

      it('auto-converts objects to form-data when files are present using the DELETE method', () => {
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/delete')

        cy.get('.content-type').should('contain.text', 'Content-Type: multipart/form-data; boundary=')
        cy.get('.method').should('have.text', 'Method: delete')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.query').should('have.text', 'QueryParams: {}')
        cy.get('.files').should('have.text', 'Files: 1')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "bar"\n}')
      })
    })
  })
})
