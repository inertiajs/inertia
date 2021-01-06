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

  describe.only('Preserve scroll', () => {
    beforeEach(() => {
      cy.visit('/visits/preserve-scroll')
      cy.get('.foo').should('have.text', 'Foo is now default')
      cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
      cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
      cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 0 & 0')

      cy.scrollTo('20px', '40px')
      cy.get('#area1').scrollTo('195px', '198px')
      cy.get('#area2').scrollTo('201px', '205px')

      cy.get('.document-position').should('have.text', 'Document scroll position is 20 & 40')
      cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 195 & 198')
      cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 201 & 205')
    })

    it('resets all tracked scroll regions when preserve-scroll is not set (visit method)', () => {
      cy.get('.reset').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')

      cy.get('.foo').should('have.text', 'Foo is now bar')
      cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
      cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
      cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 0 & 0')
    })

    it('resets all tracked scroll regions when preserve-scroll is not set (GET method)', () => {
      cy.get('.reset-get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')

      cy.get('.foo').should('have.text', 'Foo is now bar')
      cy.get('.document-position').should('have.text', 'Document scroll position is 0 & 0')
      cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
      cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 0 & 0')
    })

    it('restores all tracked scroll regions when pressing the back button (visit method)', () => {
      cy.get('.reset').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
      cy.get('.foo').should('have.text', 'Foo is now bar')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')
      cy.get('.foo').should('have.text', 'Foo is now default')

      cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
      cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
      cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 201 & 205')
    })

    it('restores all tracked scroll regions when pressing the back button (GET method)', () => {
      cy.get('.reset-get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')
      cy.get('.foo').should('have.text', 'Foo is now bar')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')
      cy.get('.foo').should('have.text', 'Foo is now default')

      cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
      cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
      cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 201 & 205')
    })

    it('restores all tracked scroll regions when pressing the back button from another website', () => {
      cy.get('.off-site').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/non-inertia')

      cy.go(-1)
      cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')

      cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
      cy.get('.foo').should('have.text', 'Foo is now default')
    })

    describe('manual visits using preserve-scroll', () => {
      it.skip('preserves all tracked scroll regions (visit method)', () => {
        cy.get('.preserve').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')

        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
        cy.get('.foo').should('have.text', 'Foo is now baz')
        cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
        cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 201 & 205')
      })

      it.skip('preserves all tracked scroll regions (GET method)', () => {
        cy.get('.preserve-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')

        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
        cy.get('.foo').should('have.text', 'Foo is now baz')
        cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
        cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 201 & 205')
      })

      it('restores all tracked scroll regions when pressing the back button (visit method)', () => {
        cy.get('.preserve').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')

        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
        cy.get('.foo').should('have.text', 'Foo is now default')
        cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
        cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 201 & 205')
      })

      it('restores all tracked scroll regions when pressing the back button (GET method)', () => {
        cy.get('.preserve-get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll-page-two')

        cy.go(-1)
        cy.url().should('eq', Cypress.config().baseUrl + '/visits/preserve-scroll')

        cy.get('.document-position').should('not.have.text', 'Document scroll position is 0 & 0')
        cy.get('.foo').should('have.text', 'Foo is now default')
        cy.get('.area1-position').should('have.text', 'Area 1 scroll position is 0 & 0')
        cy.get('.area2-position').should('have.text', 'Area 2 scroll position is 201 & 205')
      })
    })
  })
})
