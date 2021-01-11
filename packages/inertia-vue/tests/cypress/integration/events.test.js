import {tap} from '../support/commands'

describe('Events', () => {
  let alert = null
  beforeEach(() => {
    cy.visit('/events', {
      onLoad: () => cy.on('window:load', () => {
        throw 'A location/non-SPA visit was detected'
      }),
    })

    alert = cy.stub()
    cy.on('window:alert', alert)
  })

  describe('Listeners', () => {
    it('does not have any listeners by default', () => {
      cy.get('.without-listeners')
        .click()
        .wait(30)
        .then(() => {
          expect(alert.getCalls()).to.have.length(0)
        })
    })

    describe('Inertia.on', () => {
      it('returns a callback that can be used to remove the global listener', () => {
        cy.get('.remove-inertia-listener')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCalls()).to.have.length(3)
            expect(alert.getCall(0)).to.be.calledWith('Removing Inertia.on Listener')
            expect(alert.getCall(1)).to.be.calledWith('onBefore')
            expect(alert.getCall(2)).to.be.calledWith('onStart')
          })
      })
    })
  })

  describe('before', () => {
    it('fires the event when a request is about to be made', () => {
      cy.get('.before')
        .click()
        .wait(30)
        .then(() => {
          // Local Event Callback
          expect(alert.getCall(0)).to.be.calledWith('onBefore')
          tap(alert.getCall(1).lastArg, value => {
            // Assert this is the request/visit object.
            expect(value).to.be.an('object')
            expect(value).to.have.property('url')
            expect(value).to.have.property('method')
            expect(value).to.have.property('data')
            expect(value).to.have.property('headers')
            expect(value).to.have.property('onBefore')
            expect(value).to.have.property('onProgress')
            expect(value).to.have.property('preserveState')
          })

          // Global Event Listener
          expect(alert.getCall(2)).to.be.calledWith('Inertia.on(before)')
          const eventArg = tap(alert.getCall(3).lastArg, event => {
            expect(event).to.be.an('CustomEvent')
            expect(event.type).to.eq('inertia:before')

            expect(event).to.have.property('cancelable')
            expect(event.cancelable).to.be.true

            expect(event).to.have.property('detail')
            tap(event.detail, detail => {
              expect(detail).to.be.an('object')
              expect(detail).to.have.property('visit')
              tap(detail.visit, visit => {
                expect(visit).to.be.an('object')
                expect(visit).to.have.property('url')
                expect(visit).to.have.property('method')
                expect(visit).to.have.property('data')
                expect(visit).to.have.property('headers')
                expect(visit).to.have.property('onBefore')
                expect(visit).to.have.property('onProgress')
                expect(visit).to.have.property('preserveState')
              })
            })
          })

          // Native Event Listener
          expect(alert.getCall(4)).to.be.calledWith('addEventListener(inertia:before)')
          expect(alert.getCall(5)).to.be.calledWith(eventArg)

          // Ensure the listeners did not prevent the visit
          expect(alert.getCall(6)).to.be.calledWith('onStart')
        })
    })

    describe('Local Event Callbacks', () => {
      it('can prevent the visit by returning false ', () => {
        cy.get('.before-prevent-local')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCalls()).to.have.length(1)
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
          })
      })
    })

    describe('Global Inertia.on', () => {
      it('can prevent the visit by returning false ', () => {
        cy.get('.before-prevent-global-inertia')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCalls()).to.have.length(3)
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith('addEventListener(inertia:before)')
            expect(alert.getCall(2)).to.be.calledWith('Inertia.on(before)')
          })
      })
    })

    describe('Global addEventListener', () => {
      it('can prevent the visit by using preventDefault', () => {
        cy.get('.before-prevent-global-native')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCalls()).to.have.length(3)
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith('Inertia.on(before)')
            expect(alert.getCall(2)).to.be.calledWith('addEventListener(inertia:before)')
          })
      })
    })
  })
})
