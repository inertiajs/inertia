describe('Plugin', () => {
  describe('$page helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then((window) => {
        cy.task('what the')
        cy.log('--------------------------')
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        cy.log('page.$page', page.$page)
        cy.log('page.$inertia.page', page.$inertia.page)

        expect(page.$page).to.deep.equal(page.$inertia.page)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then((window) => {
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        expect(page.$page).to.be.undefined
      })
    })
  })

  describe('$inertia helper', () => {
    it('has the helper injected into the Vue component', () => {
      cy.visit('/')

      cy.window().then((window) => {
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        expect(page.$inertia).to.deep.equal(window.testing.Inertia)
      })
    })

    it('misses the helper when not registered', () => {
      cy.visit('/plugin/without')

      cy.window().then((window) => {
        const inertiaRoot = window.testing.vue.$children[0]
        const page = inertiaRoot.$children[0]

        expect(page.$inertia).to.be.undefined
      })
    })
  })
})
