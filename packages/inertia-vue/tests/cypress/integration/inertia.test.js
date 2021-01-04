describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('body > div:first-child').should(($el) => {
      expect($el.get(0).innerHTML.trim()).to.eq('Hello World!')
    })
  })

  it('has the $inertia app injected into page component', () => {
    cy.visit('/')

    cy.window().then(win => {
      const inertiaRoot = win.vm.$children[0]
      const page = inertiaRoot.$children[0]

      expect(page.$inertia).to.be.an('object')
      expect(page.$inertia).to.have.property('init')
      expect(page.$inertia).to.have.property('resolveComponent')
      expect(page.$inertia).to.have.property('page')
    })
  })

  it('has the $page helper injected into the Vue component', () => {
    cy.visit('/')

    cy.window().then(win => {
      const inertiaRoot = win.vm.$children[0]
      const page = inertiaRoot.$children[0]

      expect(page.$page).to.deep.equal(page.$inertia.page.props)
    })
  })
})
