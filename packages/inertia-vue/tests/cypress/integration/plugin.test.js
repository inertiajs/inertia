describe('Plugin', () => {
  it('shows a deprecation warning when registering via the "app" component', () => {
    cy.visit('/plugin/deprecated', {
      onBeforeLoad (window) {
        cy.spy(window.console, 'warn').as('consoleWarn')
      },
    })

    cy.window().then(window => {
      const inertiaRoot = window.testing.vue.$children[0]
      const page = inertiaRoot.$children[0]

      expect(page.$page).to.deep.equal(page.$inertia.page)
      expect(page.$inertia).to.deep.equal(window.testing.Inertia)

      cy
        .get('@consoleWarn')
        .should('be.calledWith',
          'Registering the Inertia Vue plugin via the "app" component has been deprecated. Use the new "plugin" named export instead.\n\n' +
          'import { plugin } from \'@inertiajs/inertia-vue\'\n\n' +
          'Vue.use(plugin)',
        )
    })
  })

  describe('$page helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then(window => {
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        expect(page.$page).to.deep.equal(page.$inertia.page)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then(window => {
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        expect(page.$page).to.be.undefined
      })
    })
  })

  describe('$inertia helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then(window => {
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        expect(page.$inertia).to.deep.equal(window.testing.Inertia)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then(window => {
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        expect(page.$inertia).to.be.undefined
      })
    })
  })

  describe('InertiaLink', () => {
    it('is not available when the plugin is not registered', () => {
      cy.visit('/plugin/without/inertia-link', {
        onBeforeLoad (window) {
          cy.spy(window.console, 'error').as('consoleWarn')
        },
      })

      cy
        .get('@consoleWarn')
        .should('be.calledWith',
          '[Vue warn]: Unknown custom element: <inertia-link> - did you register the component correctly? ' +
          'For recursive components, make sure to provide the "name" option.\n\n' +
          'found in\n\n' +
          '---> <Home> at app/Pages/Home.vue\n' +
          '       <Inertia>\n' +
          '         <Root>',
        )
    })

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
      it('can pass data using the GET method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/get')

        cy.get('.method').should('have.text', 'Method: get')
        cy.get('.query').should('have.text', 'QueryParams: {\n  "foo": "bar"\n}')
        cy.get('.form').should('have.text', 'FormData: {}')
      })

      it('can pass data using the POST method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/post')

        cy.get('.method').should('have.text', 'Method: post')
        cy.get('.query').should('have.text', 'QueryParams: {}')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "bar"\n}')
      })

      it('can pass data using the PUT method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/put')

        cy.get('.method').should('have.text', 'Method: put')
        cy.get('.query').should('have.text', 'QueryParams: {}')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "bar"\n}')
      })

      it('can pass data using the PATCH method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/links-target/patch')

        cy.get('.method').should('have.text', 'Method: patch')
        cy.get('.query').should('have.text', 'QueryParams: {}')
        cy.get('.form').should('have.text', 'FormData: {\n  "foo": "bar"\n}')
      })

      it('cannot pass any data using the DELETE method', () => {
        cy.visit('/links/object')

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
  })

})
