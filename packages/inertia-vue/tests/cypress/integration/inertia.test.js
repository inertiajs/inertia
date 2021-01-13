import { tap } from '../support/commands'

describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('.text').should('have.text', 'This is the Test App Entrypoint page')
  })

  it('allows transforming props before they reach the page', () => {
    cy.visit('/transform-props')

    cy.window().should('have.property', '_inertia_request_dump')
    cy.window()
      .then(window => window._inertia_request_dump)
      .then(({ $page }) => {
        tap($page.props, props => {
          expect(props).to.contain.keys(['foo', 'bar'])
          expect(props.foo).to.eq('bar')
          expect(props.bar).to.eq('transformed')
        })
      })
  })
})
