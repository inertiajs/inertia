describe('Links', () => {
  it('visits a different page', () => {
    cy.visit('/', {
      onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
    })

    cy.get('.links-method').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/links/method')

    cy.get('.text').should('have.text', 'This is the links page that demonstrates inertia-link methods')
  })

  describe('Method', () => {
    beforeEach(() => {
      cy.visit('/links/method', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
    })

    it('can use the GET method', () => {
      cy.get('.get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('get')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the POST method', () => {
      cy.get('.post').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('post')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the PUT method', () => {
      cy.get('.put').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('put')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the PATCH method', () => {
      cy.get('.patch').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('patch')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the DELETE method', () => {
      cy.get('.delete').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('delete')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })
  })

  describe('Data', () => {
    describe('plain objects', () => {
      beforeEach(() => {
        cy.visit('/links/data/object', {
          onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
        })
      })

      it('passes data as params using the GET method', () => {
        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('get')
            expect(query).to.contain.key('foo')
            expect(query.foo).to.eq('get')
            expect(form).to.be.empty
            expect(files).to.be.empty
          })
      })

      it('can pass data using the POST method', () => {
        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('post')
            expect(query).to.be.empty
            expect(form).to.contain.key('bar')
            expect(form.bar).to.eq('post')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the PUT method', () => {
        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('put')
            expect(query).to.be.empty
            expect(form).to.contain.key('baz')
            expect(form.baz).to.eq('put')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the PATCH method', () => {
        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('patch')
            expect(query).to.be.empty
            expect(form).to.contain.key('foo')
            expect(form.foo).to.eq('patch')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the DELETE method', () => {
        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('delete')
            expect(query).to.be.empty
            expect(form).to.contain.key('bar')
            expect(form.bar).to.eq('delete')
            expect(files).to.be.empty
          })
      })
    })

    describe('FormData objects', () => {
      beforeEach(() => {
        cy.visit('/links/data/form-data', {
          onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
        })
      })

      it('can pass data using the POST method', () => {
        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('post')
            expect(query).to.be.empty
            expect(form).to.contain.key('bar')
            expect(form.bar).to.eq('baz')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the PUT method', () => {
        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('put')
            expect(query).to.be.empty
            expect(form).to.contain.key('bar')
            expect(form.bar).to.eq('baz')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the PATCH method', () => {
        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('patch')
            expect(query).to.be.empty
            expect(form).to.contain.key('bar')
            expect(form.bar).to.eq('baz')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the DELETE method', () => {
        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('delete')
            expect(query).to.be.empty
            expect(form).to.contain.key('bar')
            expect(form.bar).to.eq('baz')
            expect(files).to.be.empty
          })
      })
    })

    describe('auto-converted objects (when files are present)', () => {
      beforeEach(() => {
        cy.visit('/links/data/auto-converted', {
          onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
        })
      })

      it('auto-converts objects to form-data when files are present using the POST method', () => {
        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('post')
            expect(query).to.be.empty
            expect(form).to.contain.key('foo')
            expect(form.foo).to.eq('bar')
            expect(files).to.not.be.empty
          })
      })

      it('auto-converts objects to form-data when files are present using the PUT method', () => {
        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('put')
            expect(query).to.be.empty
            expect(form).to.contain.key('foo')
            expect(form.foo).to.eq('bar')
            expect(files).to.not.be.empty
          })
      })

      it('auto-converts objects to form-data when files are present using the PATCH method', () => {
        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('patch')
            expect(query).to.be.empty
            expect(form).to.contain.key('foo')
            expect(form.foo).to.eq('bar')
            expect(files).to.not.be.empty
          })
      })

      it('auto-converts objects to form-data when files are present using the DELETE method', () => {
        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({ method, headers, form, files, query }) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('delete')
            expect(query).to.be.empty
            expect(form).to.contain.key('foo')
            expect(form.foo).to.eq('bar')
            expect(files).to.not.be.empty
          })
      })
    })
  })

  describe('Headers', () => {
    beforeEach(() => {
      cy.visit('/links/headers', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
    })

    it('has the default set of headers', () => {
      cy.get('.default').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ headers }) => {
          expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia'])
          expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
          expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
          expect(headers['x-inertia']).to.eq('true')
        })
    })

    it('contains headers specific to the "only" parameter', () => {
      cy.get('.only').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ headers }) => {
          expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia', 'x-inertia-partial-component', 'x-inertia-partial-data'])
          expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
          expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
          expect(headers['x-inertia']).to.eq('true')
          expect(headers['x-inertia-partial-data']).to.eq('foo,bar')
          expect(headers['x-inertia-partial-component']).to.eq('Links/Headers')
        })
    })

    it('allows to settings custom headers using the GET method', () => {
      cy.get('.custom').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ headers }) => {
          expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia', 'foo'])
          expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
          expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
          expect(headers['x-inertia']).to.eq('true')
          expect(headers['foo']).to.eq('bar')
        })
    })

    it('cannot override built-in Inertia headers', () => {
      cy.get('.overridden').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ headers }) => {
          expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia', 'bar'])
          expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
          expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
          expect(headers['x-inertia']).to.eq('true')
          expect(headers['bar']).to.eq('baz')
        })
    })
  })

  describe('Replace', () => {
    beforeEach(() => {
      cy.visit('/', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
    })

    it('replaces the current history state', () => {
      cy.get('.links-replace').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/links/replace')

      cy.get('.replace').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      cy.go(1)
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')
    })


    it('does not replace the current history state when it is set to false', () => {
      cy.get('.links-replace').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/links/replace')

      cy.get('.replace-false').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/links/replace')

      cy.go(1)
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')
    })
  })
})
