describe('Plugin', () => {
  describe('$page helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then((window) => {
        const vueInstance = window.testing.vue

        expect(vueInstance.$page).to.deep.equal(vueInstance.$inertia.page)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then((window) => {
        const inertiaRoot = window.testing.vue.$
        const page = inertiaRoot.subTree.component

        expect(page.$page).to.be.undefined
      })
    })
  })

  describe('$inertia helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then((window) => {
        const vueInstance = window.testing.vue

        expect(vueInstance.$inertia).to.deep.equal(window.testing.Inertia)
        expect(vueInstance.$.appContext.config.globalProperties.$inertia).to.deep.equal(window.testing.Inertia)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then((window) => {
        const inertiaRoot = window.testing.vue.$
        const page = inertiaRoot.subTree.component

        expect(page.$inertia).to.be.undefined
      })
    })
  })
})
