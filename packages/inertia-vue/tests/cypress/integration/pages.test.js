describe('Pages', () => {
  it('receives data from the controllers as props', () => {
    cy.visit('/')

    cy.window().then(window => {
      const inertiaRoot = window.testing.vue.$children[0]
      const page = inertiaRoot.$children[0]

      expect(page.$vnode.data.props).to.have.property('example')
      expect(page.$vnode.data.props.example).to.equal('FooBar')
    })
  })

  it('can have a persistent layout via the render function', () => {
    cy.visit('/persistent-layouts/via-function/simple/page-a')

    cy.window().then(window => {
      const inertiaRoot = window.testing.vue.$children[0]
      const layoutA = inertiaRoot.$children[0]
      const layoutAUid = layoutA._uid
      expect(layoutAUid).is.not.null
      cy.get('body > div > div > div > span').as('pageLabel')
      cy.get('@pageLabel').should('have.text', 'Simple Persistent Layout - Page A')

      cy.get('a').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/via-function/simple/page-b')

      cy.get('@pageLabel').should('have.text', 'Simple Persistent Layout - Page B').then(() => {
        const layoutB = inertiaRoot.$children[0]

        expect(layoutB._uid).to.eq(layoutAUid)
      })
    })
  })

  it('can create more complex layout arrangements using nested layouts via the render function', () => {
    cy.visit('/persistent-layouts/via-function/nested/page-a')

    cy.window().then(window => {
      const inertiaRoot = window.testing.vue.$children[0]
      const siteLayoutA = inertiaRoot.$children[0]
      const siteLayoutAUid = siteLayoutA._uid
      expect(siteLayoutAUid).is.not.null
      const nestedLayoutA = siteLayoutA.$children[0]
      const nestedLayoutAUid = nestedLayoutA._uid
      expect(nestedLayoutAUid).is.not.null
      cy.get('body > div > div > div > div > div > span').as('pageLabel')
      cy.get('@pageLabel').should('have.text', 'Nested Persistent Layout - Page A')

      cy.get('a').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/via-function/nested/page-b')

      cy.get('@pageLabel').should('have.text', 'Nested Persistent Layout - Page B').then(() => {
        const siteLayoutB = inertiaRoot.$children[0]
        const nestedLayoutB = siteLayoutB.$children[0]

        expect(siteLayoutB._uid).to.eq(siteLayoutAUid)
        expect(nestedLayoutB._uid).to.eq(nestedLayoutAUid)
      })
    })
  })

  it('can have a persistent layout via the shorthand', async () => {
    expect(true).to.equal(false)
  })

  it('can create more complex layout arrangements using nested layouts via the shorthand syntax', async () => {
    expect(true).to.equal(false)
  })
})
