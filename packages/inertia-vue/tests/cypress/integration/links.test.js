describe('Links', () => {
  it('visits a different page', () => {
    cy.visit('/links/basic')

    // Fail the assertion when a hard visit / location visit is made.
    // Inertia's SPA-visit should not trigger this.
    cy.on('load', () => expect(true).to.equal(false))

    cy.get('.basic').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

    cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')
  })

  describe('Methods', () => {
    it('can use the GET method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.get').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('get')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the POST method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.post').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('post')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the PUT method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.put').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('put')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the PATCH method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.patch').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

      cy.window()
        .then(window => window._inertia_request_dump)
        .then(({ method, form, query }) => {
          expect(method).to.eq('patch')
          expect(query).to.be.empty
          expect(form).to.be.empty
        })
    })

    it('can use the DELETE method', () => {
      cy.visit('/links/basic')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.delete').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
      it('passes data as params using the GET method', () => {
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.get').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/get')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/object')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
      it('can pass data using the POST method', () => {
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/form-data')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
      it('auto-converts objects to form-data when files are present using the POST method', () => {
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.post').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/post')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.put').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/put')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.patch').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/patch')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
        cy.visit('/links/auto-converted')

        // Fail the assertion when a hard visit / location visit is made.
        // Inertia's SPA-visit should not trigger this.
        cy.on('load', () => expect(true).to.equal(false))

        cy.get('.delete').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/dump/delete')

        cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
    it('has the default set of headers', () => {
      cy.visit('/links/headers')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.basic').click()

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
      cy.visit('/links/headers')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.only').click()

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
      cy.visit('/links/headers')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.custom').click()

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
      cy.visit('/links/headers')

      // Fail the assertion when a hard visit / location visit is made.
      // Inertia's SPA-visit should not trigger this.
      cy.on('load', () => expect(true).to.equal(false))

      cy.get('.overridden').click()

      cy.get('.text').should('have.text', 'This is Inertia page component containing a data dump of the request')

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
})
