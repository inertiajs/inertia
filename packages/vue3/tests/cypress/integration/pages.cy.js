describe('Pages', () => {
  it('receives data from the controllers as props', () => {
    cy.visit('/')

    cy.window().then((window) => {
      const inertiaRoot = window.testing.vue.$
      const page = inertiaRoot.subTree.component

      // When props are not declared, they become attrs
      expect(page.attrs).to.have.property('example')
      expect(page.attrs.example).to.equal('FooBar')
    })
  })

  describe('Persistent Layouts', () => {
    describe('Render Function', () => {
      it('can have a persistent layout', () => {
        cy.visit('/persistent-layouts/render-function/simple/page-a')

        cy.window().then((window) => {
          // window.testing.vue.$.vnode.component.subTree.component.uid
          const inertiaRoot = window.testing.vue.$
          const layoutA = inertiaRoot.subTree.component
          const layoutAUid = layoutA.uid
          expect(layoutAUid).is.not.null

          cy.get('.text').should('have.text', 'Simple Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/render-function/simple/page-b')

          cy.get('.text')
            .should('have.text', 'Simple Persistent Layout - Page B')
            .then(() => {
              const layoutB = inertiaRoot.subTree.component

              expect(layoutB.uid).to.eq(layoutAUid)
            })
        })
      })

      it('can create more complex layout arrangements using nested layouts', () => {
        cy.visit('/persistent-layouts/render-function/nested/page-a')

        cy.window().then((window) => {
          const inertiaRoot = window.testing.vue.$
          const siteLayoutA = inertiaRoot.subTree.component
          const siteLayoutAUid = siteLayoutA.uid
          expect(siteLayoutAUid).is.not.null
          const nestedLayoutA = siteLayoutA.subTree.children[0]
          const nestedLayoutAUid = nestedLayoutA.uid
          expect(nestedLayoutAUid).is.not.null

          cy.get('.text').should('have.text', 'Nested Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/render-function/nested/page-b')

          cy.get('.text')
            .should('have.text', 'Nested Persistent Layout - Page B')
            .then(() => {
              const siteLayoutB = inertiaRoot.subTree.component
              const nestedLayoutB = siteLayoutB.subTree.children[0]

              expect(siteLayoutB.uid).to.eq(siteLayoutAUid)
              expect(nestedLayoutB.uid).to.eq(nestedLayoutAUid)
            })
        })
      })
    })

    describe('Shorthand', () => {
      it('can have a persistent layout', () => {
        cy.visit('/persistent-layouts/shorthand/simple/page-a')

        cy.window().then((window) => {
          const inertiaRoot = window.testing.vue.$
          const layoutA = inertiaRoot.subTree.component
          const layoutAUid = layoutA.uid
          expect(layoutAUid).is.not.null

          cy.get('.text').should('have.text', 'Simple Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/shorthand/simple/page-b')

          cy.get('.text')
            .should('have.text', 'Simple Persistent Layout - Page B')
            .then(() => {
              const layoutB = inertiaRoot.subTree.component

              expect(layoutB.uid).to.eq(layoutAUid)
            })
        })
      })

      it('has the page props available within the persistent layout', () => {
        cy.visit('/persistent-layouts/shorthand/simple/page-a')

        cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/shorthand/simple/page-a')
        cy.window().should('have.property', '_inertia_page_props')
        cy.window().should('have.property', '_inertia_site_layout_props')
        cy.window().then((window) => {
          expect(window._inertia_page_props).to.not.be.undefined
          expect(window._inertia_page_props).to.have.keys('foo', 'baz')
          expect(window._inertia_site_layout_props).to.not.be.undefined
          expect(window._inertia_site_layout_props).to.have.keys('foo', 'baz')
        })
      })

      it('can create more complex layout arrangements using nested persistent layouts', () => {
        cy.visit('/persistent-layouts/shorthand/nested/page-a')

        cy.window().then((window) => {
          const inertiaRoot = window.testing.vue.$
          const siteLayoutA = inertiaRoot.subTree.component
          const siteLayoutAUid = siteLayoutA.uid
          expect(siteLayoutAUid).is.not.null
          const nestedLayoutA = siteLayoutA.subTree.children[0]
          const nestedLayoutAUid = nestedLayoutA.uid
          expect(nestedLayoutAUid).is.not.null

          cy.get('.text').as('pageLabel').should('have.text', 'Nested Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/shorthand/nested/page-b')

          cy.get('.text')
            .should('have.text', 'Nested Persistent Layout - Page B')
            .then(() => {
              const siteLayoutB = inertiaRoot.subTree.component
              const nestedLayoutB = siteLayoutB.subTree.children[0]

              expect(siteLayoutB.uid).to.eq(siteLayoutAUid)
              expect(nestedLayoutB.uid).to.eq(nestedLayoutAUid)
            })
        })
      })

      it('has the page props available within all nested persistent layouts', () => {
        cy.visit('/persistent-layouts/shorthand/nested/page-a')

        cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/shorthand/nested/page-a')
        cy.window().should('have.property', '_inertia_page_props')
        cy.window().should('have.property', '_inertia_site_layout_props')
        cy.window().should('have.property', '_inertia_nested_layout_props')
        cy.window().then((window) => {
          expect(window._inertia_page_props).to.not.be.undefined
          expect(window._inertia_page_props).to.have.keys('foo', 'baz')
          expect(window._inertia_site_layout_props).to.not.be.undefined
          expect(window._inertia_site_layout_props).to.have.keys('foo', 'baz')
          expect(window._inertia_nested_layout_props).to.not.be.undefined
          expect(window._inertia_nested_layout_props).to.have.keys('foo', 'baz')
        })
      })
    })
  })
})
