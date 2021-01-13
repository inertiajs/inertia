import {tap} from '../support/commands'

describe('Manual Visits', () => {
  it('visits a different page', () => {
    cy.visit('/', {
      onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
    })

    cy.get('.visits-method').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/visits/method')

    cy.get('.text').should('have.text', 'This is the page that demonstrates manual visit methods')
  })

  describe('Method', () => {
    beforeEach(() => {
      cy.visit('/visits/method', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
    })

    it('can use the visit method without any options to make a GET request', () => {
      cy.get('.visit-get').click()
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

    it('can use the visit method with a specific "method" option to manually set the request method', () => {
      cy.get('.visit-specific').click()
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
        cy.visit('/visits/data/object', {
          onLoad: () => cy.on('window:load', () => {
            throw 'A location/non-SPA visit was detected'
          }),
        })
      })

      it('passes data as params using the visit method', () => {
        cy.get('.visit').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({method, headers, form, files, query}) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('get')
            expect(query).to.contain.key('foo')
            expect(query.foo).to.eq('visit')
            expect(form).to.be.empty
            expect(files).to.be.empty
          })
      })

      it('passes data as params using the GET method', () => {
        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({method, headers, form, files, query}) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('get')
            expect(query).to.contain.key('bar')
            expect(query.bar).to.eq('get')
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
          .then(({method, headers, form, files, query}) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('post')
            expect(query).to.be.empty
            expect(form).to.contain.key('baz')
            expect(form.baz).to.eq('post')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the PUT method', () => {
        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({method, headers, form, files, query}) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('put')
            expect(query).to.be.empty
            expect(form).to.contain.key('foo')
            expect(form.foo).to.eq('put')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the PATCH method', () => {
        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({method, headers, form, files, query}) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('patch')
            expect(query).to.be.empty
            expect(form).to.contain.key('bar')
            expect(form.bar).to.eq('patch')
            expect(files).to.be.empty
          })
      })

      it('can pass data using the DELETE method', () => {
        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

        cy.window().should('have.property', '_inertia_request_dump')
        cy.window()
          .then(window => window._inertia_request_dump)
          .then(({method, headers, form, files, query}) => {
            expect(headers).to.contain.key('content-type')
            expect(headers['content-type']).to.contain('application/json')

            expect(method).to.eq('delete')
            expect(query).to.be.empty
            expect(form).to.contain.key('baz')
            expect(form.baz).to.eq('delete')
            expect(files).to.be.empty
          })
      })
    })

    describe('FormData objects', () => {
      beforeEach(() => {
        cy.visit('/visits/data/form-data', {
          onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
        })
      })

      it('can pass data using the visit method when specifying a non-GET "method" option', () => {
        cy.get('.visit').click()
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
            expect(form.foo).to.eq('visit')
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
            expect(headers['content-type']).to.contain('multipart/form-data; boundary=')

            expect(method).to.eq('post')
            expect(query).to.be.empty
            expect(form).to.contain.key('baz')
            expect(form.baz).to.eq('post')
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
            expect(form).to.contain.key('foo')
            expect(form.foo).to.eq('put')
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
            expect(form.bar).to.eq('patch')
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
            expect(form).to.contain.key('baz')
            expect(form.baz).to.eq('delete')
            expect(files).to.be.empty
          })
      })
    })

    describe('auto-converted objects (when files are present)', () => {
      beforeEach(() => {
        cy.visit('/visits/data/auto-converted', {
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
      cy.visit('/visits/headers', {
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

    it('allows to set custom headers using the visit method', () => {
      cy.get('.visit').click()
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

    it('allows to set custom headers using the GET method', () => {
      cy.get('.get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

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

    it('allows to set custom headers using the POST method', () => {
      cy.get('.post').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ headers }) => {
          expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia', 'baz'])
          expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
          expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
          expect(headers['x-inertia']).to.eq('true')
          expect(headers['baz']).to.eq('foo')
        })
    })

    it('allows to set custom headers using the PUT method', () => {
      cy.get('.put').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

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

    it('allows to set custom headers using the PATCH method', () => {
      cy.get('.patch').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

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

    it('allows to set custom headers using the DELETE method', () => {
      cy.get('.delete').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ headers }) => {
          expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia', 'baz'])
          expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
          expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
          expect(headers['x-inertia']).to.eq('true')
          expect(headers['baz']).to.eq('foo')
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
      cy.get('.visits-replace').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/replace')
    })

    it('replaces the current history state (visit method)', () => {
      cy.get('.replace').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      cy.go(1)
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')
    })

    it('replaces the current history state (GET method)', () => {
      cy.get('.replace-get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      cy.go(1)
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')
    })

    it('does not replace the current history state when it is set to false (visit method)', () => {
      cy.get('.replace-false').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/replace')

      cy.go(1)
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')
    })

    it('does not replace the current history state when it is set to false (GET method)', () => {
      cy.get('.replace-get-false').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/replace')

      cy.go(1)
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')
    })
  })

  describe('Preserve state', () => {
    beforeEach(() => {
      cy.visit('/visits/preserve-state', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
    })

    it('preserves the page\'s local state (visit method)', () => {
      cy.get('.foo').should('have.text', 'Foo is now default')
      cy.get('.field').type('Example value')

      cy.window().should('have.property', '_inertia_page_key')
      cy.window().then(window => {
        const componentKey = window._inertia_page_key

        cy.get('.preserve').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-state-page-two')

        cy.window().then(window => {
          expect(componentKey).to.eq(window._inertia_page_key)
          cy.get('.foo').should('have.text', 'Foo is now bar')
          cy.get('.field').should('have.value', 'Example value')
        })
      })
    })

    it('preserves the page\'s local state (GET method)', () => {
      cy.get('.foo').should('have.text', 'Foo is now default')
      cy.get('.field').type('Example value')

      cy.window().should('have.property', '_inertia_page_key')
      cy.window().then(window => {
        const componentKey = window._inertia_page_key

        cy.get('.preserve-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-state-page-two')

        cy.window().then(window => {
          expect(componentKey).to.eq(window._inertia_page_key)
          cy.get('.foo').should('have.text', 'Foo is now get-bar')
          cy.get('.field').should('have.value', 'Example value')
        })
      })
    })

    it('does not preserve the page\'s local state (visit method)', () => {
      cy.get('.foo').should('have.text', 'Foo is now default')
      cy.get('.field').type('Another value')

      cy.window().should('have.property', '_inertia_page_key')
      cy.window().then(window => {
        const componentKey = window._inertia_page_key

        cy.get('.preserve-false').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-state-page-two')

        cy.window().then(window => {
          expect(componentKey).to.not.eq(window._inertia_page_key)
          cy.get('.foo').should('have.text', 'Foo is now baz')
          cy.get('.field').should('have.value', '')
        })
      })
    })

    it('does not preserve the page\'s local state (GET method)', () => {
      cy.get('.foo').should('have.text', 'Foo is now default')
      cy.get('.field').type('Another value')

      cy.window().should('have.property', '_inertia_page_key')
      cy.window().then(window => {
        const componentKey = window._inertia_page_key

        cy.get('.preserve-get-false').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-state-page-two')

        cy.window().then(window => {
          expect(componentKey).to.not.eq(window._inertia_page_key)
          cy.get('.foo').should('have.text', 'Foo is now get-baz')
          cy.get('.field').should('have.value', '')
        })
      })
    })
  })

  describe('Preserve scroll', () => {
    describe('disabled (default)', () => {
      beforeEach(() => {
        cy.visit('/visits/preserve-scroll-false')
        cy.get('.foo').should('have.text', 'Foo is now default')
        cy.scrollTo('5px', '7px')
        cy.get('#slot').scrollTo('10px', '15px')
        cy.get('.document-position').should('have.text', 'Document scroll position is 5 & 7')
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 10 & 15')
      })

      it('does not reset untracked scroll regions in persistent layouts (visit method)', () => {
        cy.get('.reset').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-false-page-two')

        cy.get('.foo').should('have.text', 'Foo is now bar')
        cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
        cy.get('.slot-position').should('contain.text', 'Slot scroll position is 10')
        cy.get('.slot-position').should('not.contain.text', '& 0')
      })

      it('does not reset untracked scroll regions in persistent layouts (GET method)', () => {
        cy.get('.reset-get').click({ force: true })
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-false-page-two')

        cy.get('.foo').should('have.text', 'Foo is now test')
        cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
        cy.get('.slot-position').should('contain.text', 'Slot scroll position is 10')
        cy.get('.slot-position').should('not.contain.text', '& 0')
      })

      it('does not restore untracked scroll regions when pressing the back button (visit method)', () => {
        cy.get('.reset').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-false-page-two')
        cy.get('.foo').should('have.text', 'Foo is now bar')
        cy.get('#slot').scrollTo(0, 0)
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-false')
        cy.get('.foo').should('have.text', 'Foo is now default')

        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')
      })

      it('does not restore untracked scroll regions when pressing the back button (GET method)', () => {
        cy.get('.reset-get').click({ force: true })
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-false-page-two')
        cy.get('.foo').should('have.text', 'Foo is now test')
        cy.get('#slot').scrollTo(0, 0)
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-false')
        cy.get('.foo').should('have.text', 'Foo is now default')

        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')
      })

      it('does not restore untracked scroll regions when pressing the back button from another website', () => {
        cy.get('.off-site').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/non-inertia')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-false')

        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')
      })
    })

    describe('enabled', () => {
      beforeEach(() => {
        cy.visit('/visits/preserve-scroll')
        cy.get('.foo').should('have.text', 'Foo is now default')
        cy.scrollTo('5px', '7px')
        cy.get('#slot').scrollTo('10px', '15px')
        cy.get('.document-position').should('have.text', 'Document scroll position is 5 & 7')
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 10 & 15')
      })

      it('resets scroll regions to the top when doing a regular visit (visit method)', () => {
        cy.get('.reset').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
        cy.get('.foo').should('have.text', 'Foo is now bar')

        cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')
      })

      it('resets scroll regions to the top when doing a regular visit (GET method)', () => {
        cy.get('.reset-get').click({ force: true})
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
        cy.get('.foo').should('have.text', 'Foo is now test')

        cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')
      })

      it('preserves scroll regions when using the "preserve-scroll" feature (visit method)', () => {
        cy.get('.preserve').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
        cy.get('.foo').should('have.text', 'Foo is now foo')

        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('contain.text', 'Slot scroll position is 10')
        cy.get('.slot-position').should('not.contain.text', '& 0')
      })

      it('preserves scroll regions when using the "preserve-scroll" feature (GET method)', () => {
        cy.get('.preserve-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
        cy.get('.foo').should('have.text', 'Foo is now baz')

        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('contain.text', 'Slot scroll position is 10')
        cy.get('.slot-position').should('not.contain.text', '& 0')
      })

      it('restores all tracked scroll regions when pressing the back button (visit method)', () => {
        cy.get('.preserve').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
        cy.get('#slot').scrollTo(0, 0)
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')

        cy.get('.foo').should('have.text', 'Foo is now default')
        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('contain.text', 'Slot scroll position is 10')
        cy.get('.slot-position').should('not.contain.text', '& 0')
      })

      it('restores all tracked scroll regions when pressing the back button (GET method)', () => {
        cy.get('.preserve-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
        cy.get('#slot').scrollTo(0, 0)
        cy.get('.slot-position').should('have.text', 'Slot scroll position is 0 & 0')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')

        cy.get('.foo').should('have.text', 'Foo is now default')
        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('contain.text', 'Slot scroll position is 10')
        cy.get('.slot-position').should('not.contain.text', '& 0')
      })

      it.skip('restores all tracked scroll regions when pressing the back button from another website', () => {
        cy.get('.off-site').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/non-inertia')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')

        cy.get('.document-position').should('contain.text', 'Document scroll position is 5 &')
        cy.get('.document-position').should('not.contain.text', '& 0')
        cy.get('.slot-position').should('not.have.text', 'Slot scroll position is 0 & 0')
      })
    })
  })

  describe('URL fragment navigation (& automatic scrolling)', () => {
    /** @see https://github.com/inertiajs/inertia/pull/257 */

    beforeEach(() => {
      cy.visit('/visits/url-fragments', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/url-fragments')
      cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
    })

    describe('visit-method', () => {
      it('Scrolls to the fragment element when making a visit to a different page', () => {
        cy.get('.basic').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/url-fragments#target')
        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
      })

      it('Scrolls to the fragment element when making a visit to the same page', () => {
        cy.get('.fragment').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/url-fragments#target')
        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
      })

      it('Does not scroll to the fragment element when it does not exist on the page', () => {
        cy.get('.non-existent-fragment').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/url-fragments#non-existent-fragment')
        cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
      })
    })

    describe('GET-method', () => {
      it('Scrolls to the fragment element when making a visit to a different page', () => {
        cy.get('.basic-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/url-fragments#target')
        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
      })

      it('Scrolls to the fragment element when making a visit to the same page', () => {
        cy.get('.fragment-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/url-fragments#target')
        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
      })

      it('Does not scroll to the fragment element when it does not exist on the page', () => {
        cy.get('.non-existent-fragment-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/url-fragments#non-existent-fragment')
        cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
      })
    })
  })

  describe('Partial Reloads', () => {
    beforeEach(() => {
      cy.visit('/visits/partial-reloads', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')
      cy.get('.foo-text').should('have.text', 'Foo is now 1')
      cy.get('.bar-text').should('have.text', 'Bar is now 2')
      cy.get('.baz-text').should('have.text', 'Baz is now 3')
    })

    describe('visit-method', () => {
      it('does not have headers specific to partial reloads when the feature is not being used', () => {
        cy.get('.visit').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')

        cy.window().should('have.property', '_inertia_props')
        cy.window()
          .then(window => window._inertia_props)
          .then(({ headers }) => {
            expect(headers).to.not.contain.keys(['x-inertia-partial-component', 'x-inertia-partial-data'])
          })
      })

      it('has headers specific to partial reloads', () => {
        cy.get('.visit-foo-bar').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')

        cy.window().should('have.property', '_inertia_props')
        cy.window()
          .then(window => window._inertia_props)
          .then(({ headers }) => {
            expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia', 'x-inertia-partial-component', 'x-inertia-partial-data'])
            expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
            expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
            expect(headers['x-inertia']).to.eq('true')
            expect(headers['x-inertia-partial-data']).to.eq('headers,foo,bar')
            expect(headers['x-inertia-partial-component']).to.eq('Visits/PartialReloads')
          })
      })

      it('it updates all props when the feature is not being used', () => {
        cy.get('.visit').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')

        cy.get('.foo-text').should('have.text', 'Foo is now 2')
        cy.get('.bar-text').should('have.text', 'Bar is now 3')
        cy.get('.baz-text').should('have.text', 'Baz is now 4')
      })

      it('it only updates props that are passed through "only"', () => {
        cy.get('.visit-foo-bar').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')
        cy.get('.foo-text').should('have.text', 'Foo is now 2')
        cy.get('.bar-text').should('have.text', 'Bar is now 3')
        cy.get('.baz-text').should('have.text', 'Baz is now 3')

        cy.get('.visit-baz').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')
        cy.get('.foo-text').should('have.text', 'Foo is now 2')
        cy.get('.bar-text').should('have.text', 'Bar is now 3')
        cy.get('.baz-text').should('have.text', 'Baz is now 5')

        cy.get('.visit').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')
        cy.get('.foo-text').should('have.text', 'Foo is now 3')
        cy.get('.bar-text').should('have.text', 'Bar is now 4')
        cy.get('.baz-text').should('have.text', 'Baz is now 5')
      })
    })

    describe('GET-method', () => {
      it('does not have headers specific to partial reloads when the feature is not being used', () => {
        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')

        cy.window().should('have.property', '_inertia_props')
        cy.window()
          .then(window => window._inertia_props)
          .then(({ headers }) => {
            expect(headers).to.not.contain.keys(['x-inertia-partial-component', 'x-inertia-partial-data'])
          })
      })

      it('has headers specific to partial reloads', () => {
        cy.get('.get-foo-bar').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')

        cy.window().should('have.property', '_inertia_props')
        cy.window()
          .then(window => window._inertia_props)
          .then(({ headers }) => {
            expect(headers).to.contain.keys(['accept', 'x-requested-with', 'x-inertia', 'x-inertia-partial-component', 'x-inertia-partial-data'])
            expect(headers['accept']).to.eq('text/html, application/xhtml+xml')
            expect(headers['x-requested-with']).to.eq('XMLHttpRequest')
            expect(headers['x-inertia']).to.eq('true')
            expect(headers['x-inertia-partial-data']).to.eq('headers,foo,bar')
            expect(headers['x-inertia-partial-component']).to.eq('Visits/PartialReloads')
          })
      })

      it('it updates all props when the feature is not being used', () => {
        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')

        cy.get('.foo-text').should('have.text', 'Foo is now 2')
        cy.get('.bar-text').should('have.text', 'Bar is now 3')
        cy.get('.baz-text').should('have.text', 'Baz is now 4')
      })

      it('it only updates props that are passed through "only"', () => {
        cy.get('.get-foo-bar').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')
        cy.get('.foo-text').should('have.text', 'Foo is now 2')
        cy.get('.bar-text').should('have.text', 'Bar is now 3')
        cy.get('.baz-text').should('have.text', 'Baz is now 3')

        cy.get('.get-baz').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')
        cy.get('.foo-text').should('have.text', 'Foo is now 2')
        cy.get('.bar-text').should('have.text', 'Bar is now 3')
        cy.get('.baz-text').should('have.text', 'Baz is now 5')

        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/partial-reloads')
        cy.get('.foo-text').should('have.text', 'Foo is now 3')
        cy.get('.bar-text').should('have.text', 'Bar is now 4')
        cy.get('.baz-text').should('have.text', 'Baz is now 5')
      })
    })
  })

  describe('Error bags', () => {
    beforeEach(() => {
      cy.visit('/visits/error-bags', {
        onLoad: () => cy.on('window:load', () => { throw 'A location/non-SPA visit was detected' }),
      })
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/error-bags')
    })

    it('does not use error bags by default', () => {
      cy.get('.default').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, headers }) => {
          expect(method).to.eq('post')
          expect(headers).to.not.contain.key('x-inertia-error-bag')
        })
    })

    it('uses error bags using the visit method', () => {
      cy.get('.visit').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, headers }) => {
          expect(method).to.eq('post')
          expect(form).to.contain.key('foo')
          expect(form.foo).to.eq('bar')
          expect(headers).to.contain.key('x-inertia-error-bag')
          expect(headers['x-inertia-error-bag']).to.contain('visitErrorBag')
        })
    })

    it('uses error bags using the GET method', () => {
      cy.get('.get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.window().should('have.property', '_inertia_request_dump')
      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, headers }) => {
          expect(method).to.eq('post')
          expect(form).to.contain.key('foo')
          expect(form.foo).to.eq('baz')
          expect(headers).to.contain.key('x-inertia-error-bag')
          expect(headers['x-inertia-error-bag']).to.contain('postErrorBag')
        })
    })
  })

  describe('Redirects', () => {
    let alert = null
    beforeEach(() => {
      cy.visit('/', {
        onLoad: () => cy.on('window:load', () => { alert('A location/non-SPA visit was detected') }),
      })

      alert = cy.stub()
      cy.on('window:alert', alert)
    })

    it('follows 303 redirects', () => {
      cy.get('.visits-redirect')
        .click()
        .wait(50)
        .then(() => {
          cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')
          expect(alert.getCalls()).to.have.length(0)
        })
    })

    it('follows external redirects', () => {
      cy.get('.visits-redirect-external')
        .click()
        .wait(50)
        .then(() => {
          cy.url().should('eq', Cypress.config().baseUrl + '/non-inertia')
          expect(alert.getCalls()).to.have.length(1)
          expect(alert.getCall(0)).to.be.calledWith('A location/non-SPA visit was detected')
        })
    })
  })

  describe('Promise Deprecation', () => {
    beforeEach(() => {
      cy.visit('/visits/promise-deprecation', {
        onBeforeLoad: window => {
          cy.spy(window.console, 'warn').as('consoleWarn')
        },
      })
    })

    it('does not show any warnings when making a regular visit', () => {
      cy.get('.no-warning')
        .click()
        .wait(20)
        .then(() => {
          cy.get('@consoleWarn').should('not.be.called')
        })
    })

    it('displays a warning when trying to chain a .then on visit calls (visit method)', () => {
      cy.get('.then')
        .click()
        .wait(20)
        .then(() => {
          cy
            .get('@consoleWarn')
            .should('be.calledWith',
              'Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\n' +
              'Learn more at https://inertiajs.com/manual-visits#promise-deprecation',
            )
        })
    })

    it('displays a warning when trying to chain a .then on visit calls (GET method)', () => {
      cy.get('.then-get')
        .click()
        .wait(20)
        .then(() => {
          cy
            .get('@consoleWarn')
            .should('be.calledWith',
              'Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\n' +
              'Learn more at https://inertiajs.com/manual-visits#promise-deprecation',
            )
        })
    })

    it('displays a warning when trying to chain a .catch on visit calls (visit method)', () => {
      cy.get('.catch')
        .click()
        .wait(20)
        .then(() => {
          cy
            .get('@consoleWarn')
            .should('be.calledWith',
              'Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\n' +
              'Learn more at https://inertiajs.com/manual-visits#promise-deprecation',
            )
        })
    })

    it('displays a warning when trying to chain a .catch on visit calls (GET method)', () => {
      cy.get('.catch-get')
        .click()
        .wait(20)
        .then(() => {
          cy
            .get('@consoleWarn')
            .should('be.calledWith',
              'Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\n' +
              'Learn more at https://inertiajs.com/manual-visits#promise-deprecation',
            )
        })
    })

    it('displays a warning when trying to chain a .finally on visit calls (visit method)', () => {
      cy.get('.finally')
        .click()
        .wait(20)
        .then(() => {
          cy
            .get('@consoleWarn')
            .should('be.calledWith',
              'Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\n' +
              'Learn more at https://inertiajs.com/manual-visits#promise-deprecation',
            )
        })
    })

    it('displays a warning when trying to chain a .finally on visit calls (GET method)', () => {
      cy.get('.finally-get')
        .click()
        .wait(20)
        .then(() => {
          cy
            .get('@consoleWarn')
            .should('be.calledWith',
              'Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\n' +
              'Learn more at https://inertiajs.com/manual-visits#promise-deprecation',
            )
        })
    })
  })
})
