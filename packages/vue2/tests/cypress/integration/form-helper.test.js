import { tap } from '../support/commands'

describe('Form Helper', () => {
  describe('Methods', () => {
    beforeEach(() => {
      cy.visit('/form-helper/methods', {
        onLoad: () =>
          cy.on('window:load', () => {
            throw 'A location/non-SPA visit was detected'
          }),
      })

      cy.get('#remember').check()
    })

    it('can submit the form using the POST method', () => {
      cy.get('.post').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('post')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('foo')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })

    it('can submit the form using the PUT method', () => {
      cy.get('.put').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('put')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('foo')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })

    it('can submit the form using the PATCH method', () => {
      cy.get('.patch').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('patch')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('foo')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })

    it('can submit the form using the DELETE method', () => {
      cy.get('.delete').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('delete')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('foo')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })
  })

  describe('Transform', () => {
    beforeEach(() => {
      cy.visit('/form-helper/transform', {
        onLoad: () =>
          cy.on('window:load', () => {
            throw 'A location/non-SPA visit was detected'
          }),
      })

      cy.get('#remember').check()
    })

    it('can transform the form prior to submission using the POST method', () => {
      cy.get('.post').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('post')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('bar')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })

    it('can transform the form prior to submission using the PUT method', () => {
      cy.get('.put').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('put')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('baz')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })

    it('can transform the form prior to submission using the PATCH method', () => {
      cy.get('.patch').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('patch')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('foo')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })

    it('can transform the form prior to submission using the DELETE method', () => {
      cy.get('.delete').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then((window) => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('delete')
          expect(query).to.be.empty
          expect(form).to.have.property('name')
          expect(form.name).to.eq('bar')
          expect(form).to.have.property('remember')
          expect(form.remember).to.eq(true)
        })
    })
  })

  describe('Errors', () => {
    beforeEach(() => {
      cy.visit('/form-helper/errors', {
        onLoad: () =>
          cy.on('window:load', () => {
            throw 'A location/non-SPA visit was detected'
          }),
      })

      cy.get('.errors-status').should('have.text', 'Form has no errors')
      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()
    })

    it('can display form errors', () => {
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')

      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/errors')

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')
    })

    it('can clear all form errors', () => {
      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/errors')

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')

      cy.get('.clear').click()

      cy.get('.errors-status').should('have.text', 'Form has no errors')
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')
    })

    it('does not reset fields back to their initial values when it clears all form errors', () => {
      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/errors')

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')

      cy.get('.clear').click()

      cy.get('.errors-status').should('have.text', 'Form has no errors')
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')
    })

    it('can clear a subset of form errors', () => {
      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/errors')

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')

      cy.get('.clear-one').click()

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')
    })

    it('does not reset fields back to their initial values when it clears a subset of form errors', () => {
      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/errors')

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')

      cy.get('.clear-one').click()

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('not.exist')
      cy.get('.remember_error').should('not.exist')
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')
    })

    it('can set a single error', () => {
      cy.get('.set-one').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/errors')

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('not.exist')
      cy.get('.handle_error').should('have.text', 'Manually set Handle error')
      cy.get('.remember_error').should('not.exist')
    })

    it('can set multiple errors', () => {
      cy.get('.set').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/errors')

      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Manually set Name error')
      cy.get('.handle_error').should('have.text', 'Manually set Handle error')
      cy.get('.remember_error').should('not.exist')
    })
  })

  describe('Data', () => {
    beforeEach(() => {
      cy.visit('/form-helper/data', {
        onLoad: () =>
          cy.on('window:load', () => {
            throw 'A location/non-SPA visit was detected'
          }),
      })
    })

    it('can reset all fields to their initial values', () => {
      cy.get('#name').clear().type('A')
      cy.get('#remember').check()

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'example')
      cy.get('#remember').should('be.checked')

      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/data')

      cy.get('.reset').click()

      cy.get('#name').should('have.value', 'foo')
      cy.get('#handle').should('have.value', 'example')
      cy.get('#remember').should('not.be.checked')
    })

    it('can reset a single field to its initial value', () => {
      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()

      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/data')

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')

      cy.get('.reset-one').click()

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'example')
      cy.get('#remember').should('be.checked')
    })

    it('does not reset errors when it resets a field to its initial value', () => {
      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()

      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/data')
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')
      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')

      cy.get('.reset-one').click()

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'example')
      cy.get('#remember').should('be.checked')
      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')
    })

    it('does not reset errors when it resets all fields to their initial values', () => {
      cy.get('#name').clear().type('A')
      cy.get('#handle').clear().type('B')
      cy.get('#remember').check()

      cy.get('.submit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/form-helper/data')
      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'B')
      cy.get('#remember').should('be.checked')
      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')

      cy.get('.reset-one').click()

      cy.get('#name').should('have.value', 'A')
      cy.get('#handle').should('have.value', 'example')
      cy.get('#remember').should('be.checked')
      cy.get('.errors-status').should('have.text', 'Form has errors')
      cy.get('.name_error').should('have.text', 'Some name error')
      cy.get('.handle_error').should('have.text', 'The Handle was invalid')
      cy.get('.remember_error').should('not.exist')
    })

    describe('Update "reset" defaults', () => {
      beforeEach(() => {
        cy.get('#name').should('have.value', 'foo')
        cy.get('#handle').should('have.value', 'example')
        cy.get('#remember').should('not.be.checked')
      })

      it('can assign the current values as the new defaults', () => {
        cy.get('#name').clear().type('A')
        cy.get('#handle').clear().type('B')
        cy.get('#remember').check()

        cy.get('.reassign').click()

        cy.get('#name').clear().type('foo')
        cy.get('#handle').clear().type('example')
        cy.get('#remember').uncheck()
        cy.get('#name').should('have.value', 'foo')
        cy.get('#handle').should('have.value', 'example')
        cy.get('#remember').should('not.be.checked')

        cy.get('.reset').click()

        cy.get('#name').should('have.value', 'A')
        cy.get('#handle').should('have.value', 'B')
        cy.get('#remember').should('be.checked')
      })

      it('can assign new defaults for multiple fields', () => {
        cy.get('.reassign-object').click()

        cy.get('#name').should('have.value', 'foo')
        cy.get('#handle').should('have.value', 'example')
        cy.get('#remember').should('not.be.checked')
        cy.get('.reset-one').click()
        cy.get('#name').should('have.value', 'foo')
        cy.get('#handle').should('have.value', 'updated handle')
        cy.get('#remember').should('not.be.checked')
        cy.get('.reset').click()
        cy.get('#name').should('have.value', 'foo')
        cy.get('#handle').should('have.value', 'updated handle')
        cy.get('#remember').should('be.checked')
      })

      it('can assign new default for a single field', () => {
        cy.get('.reassign-single').click()

        cy.get('#name').should('have.value', 'foo')
        cy.get('#handle').should('have.value', 'example')
        cy.get('#remember').should('not.be.checked')
        cy.get('.reset').click()
        cy.get('#name').should('have.value', 'single value')
        cy.get('#handle').should('have.value', 'example')
        cy.get('#remember').should('not.be.checked')
      })
    })
  })

  describe('Events', () => {
    let alert = null
    beforeEach(() => {
      cy.visit('/form-helper/events', {
        onLoad: () =>
          cy.on('window:load', () => {
            throw 'A location/non-SPA visit was detected'
          }),
      })

      alert = cy.stub()
      cy.on('window:alert', alert)
    })

    describe('onBefore', () => {
      it('fires when a request is about to be made', () => {
        cy.get('.before')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            tap(alert.getCall(1).lastArg, (visit) => {
              // Assert this is the request/visit object.
              expect(visit).to.be.an('object')
              expect(visit).to.have.property('url')
              expect(visit).to.have.property('method')
              expect(visit).to.have.property('data')
              expect(visit).to.have.property('headers')
              expect(visit).to.have.property('preserveState')
            })
          })
      })

      it('can prevent the visit from starting by returning false', () => {
        cy.get('.before-cancel')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCalls()).to.have.length(1)
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
          })
      })

      it('will reset the successful and recently successful statuses immediately when the form gets (re)submitted', () => {
        cy.get('.success-status').should('have.text', 'Form was not successful')
        cy.get('.recently-status').should('have.text', 'Form was not recently successful')

        cy.get('.submit').click()
        cy.get('.success-status').should('have.text', 'Form was successful')
        cy.get('.recently-status').should('have.text', 'Form was recently successful')

        cy.get('.before-cancel').click()
        cy.get('.success-status').should('have.text', 'Form was not successful')
        cy.get('.recently-status').should('have.text', 'Form was not recently successful')
      })
    })

    describe('onStart', () => {
      it('fires when the request has started', () => {
        cy.get('.start')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(2)).to.be.calledWith('onStart')
            tap(alert.getCall(3).lastArg, (visit) => {
              // Assert this is the request/visit object.
              expect(visit).to.be.an('object')
              expect(visit).to.have.property('url')
              expect(visit).to.have.property('method')
              expect(visit).to.have.property('data')
              expect(visit).to.have.property('headers')
              expect(visit).to.have.property('preserveState')
            })
          })
      })

      it('marks the form as processing', () => {
        cy.get('.success-processing')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(2)).to.be.calledWith('onCancelToken')
            expect(alert.getCall(3)).to.be.calledWith(false)
            expect(alert.getCall(4)).to.be.calledWith('onStart')
            expect(alert.getCall(5)).to.be.calledWith(true)
          })
      })
    })

    describe('onProgress', () => {
      it('fires when the form has files (and upload progression occurs)', () => {
        cy.get('.progress')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(3)).to.be.calledWith('onProgress')
            tap(alert.getCall(4).lastArg, (event) => {
              expect(event).to.have.property('percentage')
              expect(event).to.have.property('total')
              expect(event).to.have.property('loaded')
              expect(event.percentage).to.be.gte(0).and.lte(100)
            })
          })
      })

      it('does not fire when the form has no files', () => {
        cy.get('.no-progress')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCalls()).to.have.length(10)
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith(null)
            expect(alert.getCall(2)).to.be.calledWith('onCancelToken')
            expect(alert.getCall(3)).to.be.calledWith(null)
            expect(alert.getCall(4)).to.be.calledWith('onStart')
            expect(alert.getCall(5)).to.be.calledWith(null)
            expect(alert.getCall(6)).to.be.calledWith('onSuccess')
            expect(alert.getCall(7)).to.be.calledWith(null)
            expect(alert.getCall(8)).to.be.calledWith('onFinish')
            expect(alert.getCall(9)).to.be.calledWith(null)
          })
      })

      it('updates the progress property of the form', () => {
        cy.get('.success-progress')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(4)).to.be.calledWith('onStart')
            expect(alert.getCall(5)).to.be.calledWith(null)

            expect(alert.getCall(6)).to.be.calledWith('onProgress')
            tap(alert.getCall(7).lastArg, (event) => {
              expect(event).to.have.property('percentage')
              expect(event).to.have.property('total')
              expect(event).to.have.property('loaded')
              expect(event.percentage).to.be.gte(0).and.lte(100)
            })
          })
      })
    })

    describe('onCancel', () => {
      it('fires when the request was cancelled', () => {
        cy.get('.cancel')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(4)).to.be.calledWith('onCancel')
          })
      })
    })

    describe('onSuccess', () => {
      it('fires the request succeeds without validation errors', () => {
        cy.get('.success')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith('onCancelToken')
            expect(alert.getCall(2)).to.be.calledWith('onStart')
            expect(alert.getCall(3)).to.be.calledWith('onSuccess')
            tap(alert.getCall(4).lastArg, (page) => {
              expect(page).to.be.an('object')
              expect(page).to.have.property('component')
              expect(page).to.have.property('props')
              expect(page).to.have.property('url')
              expect(page).to.have.property('version')
            })
          })
      })

      it('marks the form as no longer processing', () => {
        cy.get('.success-processing')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(4)).to.be.calledWith('onStart')
            expect(alert.getCall(5)).to.be.calledWith(true)

            expect(alert.getCall(6)).to.be.calledWith('onSuccess')
            expect(alert.getCall(7)).to.be.calledWith(false)
          })
      })

      it('resets the progress property back to null', () => {
        cy.get('.success-progress')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(6)).to.be.calledWith('onProgress')
            tap(alert.getCall(7).lastArg, (event) => {
              expect(event).to.have.property('percentage')
              expect(event).to.have.property('total')
              expect(event).to.have.property('loaded')
              expect(event.percentage).to.be.gte(0).and.lte(100)
            })

            expect(alert.getCall(8)).to.be.calledWith('onSuccess')
            expect(alert.getCall(9)).to.be.calledWith(null)
          })
      })

      it('can delay onFinish from firing by returning a promise', () => {
        cy.get('.success-promise')
          .click()
          .wait(50)
          .then(() => {
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith('onCancelToken')
            expect(alert.getCall(2)).to.be.calledWith('onStart')
            expect(alert.getCall(3)).to.be.calledWith('onSuccess')
            expect(alert.getCall(4)).to.be.calledWith(
              'onFinish should have been fired by now if Promise functionality did not work',
            )
            expect(alert.getCall(5)).to.be.calledWith('onFinish')
          })
      })

      it('clears all existing errors and resets the hasErrors prop', () => {
        cy.get('.success-reset-errors')
          .click()
          .wait(50)
          .then(() => {
            expect(alert.getCalls()).to.have.length(10)

            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith(false)

            expect(alert.getCall(2)).to.be.calledWith('onError')
            expect(alert.getCall(3)).to.be.calledWith(true)

            expect(alert.getCall(4)).to.be.calledWith('onStart')
            expect(alert.getCall(5)).to.be.calledWith(true)
            tap(alert.getCall(6).lastArg, (errors) => {
              expect(errors).to.be.an('object')
              expect(errors).to.have.property('name')
              expect(errors.name).to.eq('Some name error')
            })

            expect(alert.getCall(7)).to.be.calledWith('onSuccess')
            expect(alert.getCall(8)).to.be.calledWith(false)
            expect(alert.getCall(9)).to.be.an('object')
            expect(alert.getCall(9).lastArg).to.be.empty
          })
      })

      it('will mark the form as being submitted successfully', () => {
        cy.get('.success-status').should('have.text', 'Form was not successful')

        cy.get('.submit').click()

        cy.get('.success-status').should('have.text', 'Form was successful')
      })

      it('will only mark the form as "recently successful" for two seconds', () => {
        cy.get('.success-status').should('have.text', 'Form was not successful')
        cy.get('.recently-status').should('have.text', 'Form was not recently successful')

        cy.get('.submit').click()

        cy.get('.success-status').should('have.text', 'Form was successful')
        cy.get('.recently-status').should('have.text', 'Form was recently successful')
        cy.wait(2020).then(() => {
          cy.get('.success-status').should('have.text', 'Form was successful')
          cy.get('.recently-status').should('have.text', 'Form was not recently successful')
        })
      })
    })

    describe('onError', () => {
      it('fires when the request finishes with validation errors', () => {
        cy.get('.error')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith('onCancelToken')
            expect(alert.getCall(2)).to.be.calledWith('onStart')
            expect(alert.getCall(3)).to.be.calledWith('onError')
            tap(alert.getCall(4).lastArg, (errors) => {
              expect(errors).to.be.an('object')
              expect(errors).to.have.property('name')
              expect(errors.name).to.eq('Some name error')
            })
          })
      })

      it('marks the form as no longer processing', () => {
        cy.get('.error-processing')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(4)).to.be.calledWith('onStart')
            expect(alert.getCall(5)).to.be.calledWith(true)

            expect(alert.getCall(6)).to.be.calledWith('onError')
            expect(alert.getCall(7)).to.be.calledWith(false)
          })
      })

      it('resets the progress property back to null', () => {
        cy.get('.error-progress')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(6)).to.be.calledWith('onProgress')
            tap(alert.getCall(7).lastArg, (event) => {
              expect(event).to.have.property('percentage')
              expect(event).to.have.property('total')
              expect(event).to.have.property('loaded')
              expect(event.percentage).to.be.gte(0).and.lte(100)
            })

            expect(alert.getCall(8)).to.be.calledWith('onError')
            expect(alert.getCall(9)).to.be.calledWith(null)
          })
      })

      it('sets form errors', () => {
        cy.get('.errors-set-on-error')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(2)).to.be.calledWith('onStart')
            expect(alert.getCall(3)).to.be.an('object')
            expect(alert.getCall(3).lastArg).to.be.empty

            expect(alert.getCall(4)).to.be.calledWith('onError')
            tap(alert.getCall(5).lastArg, (errors) => {
              expect(errors).to.be.an('object')
              expect(errors).to.have.property('name')
              expect(errors.name).to.eq('Some name error')
            })
          })
      })

      it('can delay onFinish from firing by returning a promise', () => {
        cy.get('.error-promise')
          .click()
          .wait(50)
          .then(() => {
            expect(alert.getCall(0)).to.be.calledWith('onBefore')
            expect(alert.getCall(1)).to.be.calledWith('onCancelToken')
            expect(alert.getCall(2)).to.be.calledWith('onStart')
            expect(alert.getCall(3)).to.be.calledWith('onError')
            expect(alert.getCall(4)).to.be.calledWith(
              'onFinish should have been fired by now if Promise functionality did not work',
            )
            expect(alert.getCall(5)).to.be.calledWith('onFinish')
          })
      })
    })

    describe('onFinish', () => {
      it('fires when the request is completed', () => {
        cy.get('.successful-request')
          .click()
          .wait(30)
          .then(() => {
            expect(alert.getCall(4)).to.be.calledWith('onFinish')
          })
      })
    })
  })
})
