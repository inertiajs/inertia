describe('Plugin', () => {
  it('shows a deprecation warning when registering via the "app" component', () => {
    cy.visit('/plugin/deprecated', {
      onBeforeLoad(window) {
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
        onBeforeLoad(window) {
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
  })

})
