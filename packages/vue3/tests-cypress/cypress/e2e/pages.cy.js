describe('Pages', () => {
  it('receives data from the controllers as props', () => {
    cy.visit('/')

    cy.window().then((window) => {
      cy.log('vue obj', window.testing.vue._)

      expect(window._inertia_props).to.have.property('example')
      expect(window._inertia_props.example).to.equal('FooBar')
    })
  })

  describe('Persistent Layouts', () => {
    describe('Render Function', () => {
      it('can have a persistent layout', () => {
        cy.visit('/persistent-layouts/render-function/simple/page-a')

        cy.window().then((window) => {
          const layoutAUid = window._inertia_layout_id
          expect(layoutAUid).is.not.null

          cy.get('.text').should('have.text', 'Simple Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/render-function/simple/page-b')

          cy.get('.text')
            .should('have.text', 'Simple Persistent Layout - Page B')
            .then(() => {
              const layoutBUid = window._inertia_layout_id

              expect(layoutBUid).to.eq(layoutAUid)
            })
        })
      })

      it('can create more complex layout arrangements using nested layouts', () => {
        cy.visit('/persistent-layouts/render-function/nested/page-a')

        cy.window().then((window) => {
          const siteLayoutAUid = window._inertia_nested_layout_id
          expect(siteLayoutAUid).is.not.null
          const nestedLayoutAUid = window._inertia_layout_id
          expect(nestedLayoutAUid).is.not.null

          cy.get('.text').should('have.text', 'Nested Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/render-function/nested/page-b')

          cy.get('.text')
            .should('have.text', 'Nested Persistent Layout - Page B')
            .then(() => {
              const siteLayoutBUid = window._inertia_nested_layout_id
              const nestedLayoutBUid = window._inertia_layout_id

              expect(siteLayoutBUid).to.eq(siteLayoutAUid)
              expect(nestedLayoutBUid).to.eq(nestedLayoutAUid)
            })
        })
      })
    })

    describe('Shorthand', () => {
      it('can have a persistent layout', () => {
        cy.visit('/persistent-layouts/shorthand/simple/page-a')

        cy.window().then((window) => {
          const layoutAUid = window._inertia_layout_id
          expect(layoutAUid).is.not.null

          cy.get('.text').should('have.text', 'Simple Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/shorthand/simple/page-b')

          cy.get('.text')
            .should('have.text', 'Simple Persistent Layout - Page B')
            .then(() => {
              const layoutBUid = window._inertia_layout_id

              expect(layoutBUid).to.eq(layoutAUid)
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
          const siteLayoutAUid = window._inertia_nested_layout_id
          expect(siteLayoutAUid).is.not.null
          const nestedLayoutAUid = window._inertia_layout_id
          expect(nestedLayoutAUid).is.not.null

          cy.get('.text').as('pageLabel').should('have.text', 'Nested Persistent Layout - Page A')

          cy.get('a').click()
          cy.url().should('eq', Cypress.config().baseUrl + '/persistent-layouts/shorthand/nested/page-b')

          cy.get('.text')
            .should('have.text', 'Nested Persistent Layout - Page B')
            .then(() => {
              const siteLayoutBUid = window._inertia_nested_layout_id
              const nestedLayoutBUid = window._inertia_layout_id

              expect(siteLayoutBUid).to.eq(siteLayoutAUid)
              expect(nestedLayoutBUid).to.eq(nestedLayoutAUid)
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
