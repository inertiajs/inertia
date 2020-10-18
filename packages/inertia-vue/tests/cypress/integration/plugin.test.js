describe('Plugin', () => {
  it('has the $page and $inertia helpers injected into the Vue component', () => {
    cy.visit('/')

    cy.window().then(window => {
      const inertiaRoot = window.testing.vue.$children[0]
      const page = inertiaRoot.$children[0]

      expect(page.$page).to.deep.equal(page.$inertia.page)
      expect(page.$inertia).to.deep.equal(window.testing.Inertia)
    })
  })

  it('misses the $inertia or $page helpers when not registered', () => {
    cy.visit('/plugin/without')

    cy.window().then(window => {
      const inertiaRoot = window.testing.vue.$children[0]
      const page = inertiaRoot.$children[0]

      expect(page.$inertia).to.be.undefined
      expect(page.$page).to.be.undefined
    })
  })

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
})
