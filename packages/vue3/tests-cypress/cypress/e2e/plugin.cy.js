describe('Plugin', () => {
  describe('$page helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then((window) => {
        expect(window.initialPage).to.not.be.null
        expect(window._plugin_global_props.$page).to.deep.equal(window.initialPage)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then((window) => {
        expect(window._plugin_global_props.$page).to.be.undefined
      })
    })
  })

  describe('$inertia helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then((window) => {
        expect(window._plugin_global_props.$inertia).to.deep.equal(window.testing.Inertia)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then((window) => {
        expect(window._plugin_global_props.$inertia).to.be.undefined
      })
    })
  })
})
