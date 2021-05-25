import { tap } from '../support/commands'

describe('Inertia', () => {
  it('mounts the initial page', () => {
    cy.visit('/')

    cy.get('.text').should('have.text', 'This is the Test App Entrypoint page')
  })

  it('allows to resolve errors in a custom way by overriding the resolveErrors method', () => {
    cy.visit('/error-resolver', {
      onLoad: () => cy.on('window:load', () => {
        throw 'A location/non-SPA visit was detected'
      }),
    })

    const alert = cy.stub()
    cy.on('window:alert', alert)

    cy.get('.visit')
      .click()
      .wait(30)
      .then(() => {
        expect(alert.getCalls()).to.have.length(2)
        // Assert that the page is passed in to the resolver
        tap(alert.getCall(0).lastArg, page => {
          expect(page).to.be.an('object')
          expect(page).to.have.property('component')
          expect(page).to.have.property('props')
          expect(page).to.have.property('url')
          expect(page).to.have.property('version')
        })
        // Assert that the resolved errors end up being the returned value
        tap(alert.getCall(1).lastArg, errors => {
          expect(errors).to.have.key('overloaded')
          expect(errors.overloaded).to.eq('manually')
        })
      })

  })
})
