const path = require('path')
const express = require('express')
const inertia = require('./helpers')
const bodyParser = require('body-parser')
const multer = require('multer')
const { showServerStatus } = require('./server-status')
const { getUserNames, paginateUsers } = require('./eloquent')

const app = express()

// Express v5 defaults to 'simple' query parser, but tests expect 'extended' behavior from < v5
app.set('query parser', 'extended')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const upload = multer()

const adapters = ['react', 'svelte', 'vue3']

if (!adapters.includes(inertia.package)) {
  throw new Error(`Invalid adapter package "${inertia.package}". Expected one of: ${adapters.join(', ')}.`)
}

app.all('/non-inertia', (req, res) =>
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Non-Inertia Page</title></head>
      <body>
        <h1>This is a page that does not have the Inertia app loaded.</h1>
        <p><a href="/navigate-non-inertia">Go to Inertia page</a></p>
      </body>
    </html>
  `),
)

app.get('/non-inertia/download', (req, res) => {
  const query = new URLSearchParams(req.query).toString()
  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(`query:${query}`)
})

// SSR test routes (only rendered with SSR when SSR=true)
app.get('/ssr/page1', (req, res) =>
  inertia.renderSSR(req, res, {
    component: 'SSR/Page1',
    props: {
      user: { name: 'John Doe', email: 'john@example.com' },
      items: ['Item 1', 'Item 2', 'Item 3'],
      count: 42,
    },
  }),
)

app.get('/ssr/page2', (req, res) =>
  inertia.renderSSR(req, res, {
    component: 'SSR/Page2',
    props: {
      navigatedTo: true,
    },
  }),
)

app.get('/ssr/page-with-script-element', (req, res) =>
  inertia.renderSSR(req, res, {
    component: 'SSR/PageWithScriptElement',
    props: {
      message: 'Hello from script element! Escape </script>.',
    },
  }),
)

// SSR auto-transform test routes (uses the Vite plugin SSR transform)
app.get('/ssr-auto/page1', (req, res) =>
  inertia.renderSSRAuto(req, res, {
    component: 'SSR/Page1',
    props: {
      user: { name: 'Auto User', email: 'auto@example.com' },
      items: ['Auto 1', 'Auto 2', 'Auto 3'],
      count: 100,
    },
  }),
)

app.get('/ssr-auto/page2', (req, res) =>
  inertia.renderSSRAuto(req, res, {
    component: 'SSR/Page2',
    props: {
      navigatedTo: true,
    },
  }),
)

// createInertiaApp (unified) test routes
app.get('/unified', (req, res) =>
  inertia.renderUnified(req, res, {
    component: 'Home',
    props: {
      example: 'FooBar',
    },
  }),
)

app.get('/unified/navigate', (req, res) =>
  inertia.renderUnified(req, res, {
    component: 'Home',
    props: {
      example: 'Navigated',
    },
  }),
)

app.get('/unified/props', (req, res) =>
  inertia.renderUnified(req, res, {
    component: 'Unified/Props',
    props: {
      foo: 'bar',
      count: 42,
      items: ['a', 'b', 'c'],
    },
  }),
)

// Auto transform test routes (pages shorthand transformed by Vite plugin)
// Uses VitePages directory to prove transform uses the configured path
app.get('/auto', (req, res) =>
  inertia.renderAuto(req, res, {
    component: 'Home',
    props: {
      example: 'AutoTransform',
    },
  }),
)

app.get('/auto/props', (req, res) =>
  inertia.renderAuto(req, res, {
    component: 'Props',
    props: {
      foo: 'vite-bar',
      count: 123,
      items: ['vite', 'plugin', 'test'],
    },
  }),
)

// Intercepts all CSS and JS assets (including files loaded via code splitting)
app.get(/.*\.(?:js|css)$/, (req, res) => {
  const filePath = path.resolve(__dirname, '../../packages/', inertia.package, 'test-app/dist', req.path.substring(1))
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Not found')
    }
  })
})

/**
 * Used for testing the Inertia plugin is registered.
 * @see plugin.test.js
 */
app.get('/plugin/*enabled', (req, res) =>
  inertia.render(req, res, {
    component: 'Home',
    props: {
      example: 'FooBar',
    },
  }),
)

/**
 * Our actual 'app' routes
 */
app.get('/', (req, res) =>
  inertia.render(req, res, {
    component: 'Home',
    props: {
      example: 'FooBar',
    },
  }),
)

app.get('/article', (req, res) =>
  inertia.render(req, res, {
    component: 'Article',
    props: {},
    encryptHistory: true,
  }),
)

app.get('/scroll-after-render/:page', (req, res) =>
  inertia.render(req, res, {
    component: 'ScrollAfterRender',
    props: { page: parseInt(req.params.page) },
  }),
)

app.get('/scroll-smooth/:page', (req, res) =>
  inertia.render(req, res, {
    component: 'ScrollSmooth',
    props: { page: req.params.page },
  }),
)

app.get('/links/partial-reloads', (req, res) =>
  inertia.render(req, res, {
    component: 'Links/PartialReloads',
    props: {
      headers: req.headers,
      foo: Number.parseInt(req.query.foo || 0) + 1,
      bar: (props) => props.foo + 1,
      baz: (props) => props.foo + 2,
    },
  }),
)
app.all('/error-modal', (req, res) => inertia.render(req, res, { component: 'ErrorModal' }))
app.all('/links/preserve-state-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Links/PreserveState', props: { foo: req.query.foo } }),
)
app.all('/links/preserve-scroll-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Links/PreserveScroll', props: { foo: req.query.foo } }),
)
app.all('/links/preserve-scroll-false-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Links/PreserveScrollFalse', props: { foo: req.query.foo } }),
)
app.get('/links/preserve-url', (req, res) => {
  const page = parseInt(req.query.page || '1')
  const itemsPerPage = 3

  const allItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
  const startIndex = (page - 1) * itemsPerPage
  const data = allItems.slice(startIndex, startIndex + itemsPerPage)

  const hasNextPage = startIndex + itemsPerPage < allItems.length
  const nextPageUrl = hasNextPage ? `/links/preserve-url?page=${page + 1}` : null

  return inertia.render(req, res, {
    component: 'Links/PreserveUrl',
    props: {
      foo: req.query.foo || 'default',
      items: {
        data,
        next_page_url: nextPageUrl,
      },
    },
    deepMergeProps: ['items'],
  })
})
app.all('/links/preserve-url-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Links/PreserveUrl', props: { foo: req.query.foo } }),
)
app.get('/links/as-warning/:method', (req, res) =>
  inertia.render(req, res, { component: 'Links/AsWarning', props: { method: req.params.method } }),
)
app.get('/links/as-warning-false/:method', (req, res) =>
  inertia.render(req, res, { component: 'Links/AsWarningFalse', props: { method: req.params.method } }),
)
app.get('/links/headers/version', (req, res) =>
  inertia.render(req, res, { component: 'Links/Headers', version: 'example-version-header' }),
)
app.get('/links/data-loading', (req, res) => inertia.render(req, res, { component: 'Links/DataLoading' }))
app.get('/links/prop-update', (req, res) => inertia.render(req, res, { component: 'Links/PropUpdate' }))
app.get('/links/sub', (req, res) => inertia.render(req, res, { component: 'Links/PathTraversal' }))
app.get('/links/sub/sub', (req, res) => inertia.render(req, res, { component: 'Links/PathTraversal' }))
app.get('/links/reactivity', (req, res) => inertia.render(req, res, { component: 'Links/Reactivity' }))
app.get('/links/as-component/:page', (req, res) =>
  inertia.render(req, res, { component: 'Links/AsComponent', props: { page: req.params.page } }),
)
app.get('/links/as-element/:page', (req, res) =>
  inertia.render(req, res, { component: 'Links/AsElement', props: { page: req.params.page } }),
)
app.get('/links/cancel-sync-request/:page', (req, res) => {
  const page = req.params.page
  setTimeout(
    () => inertia.render(req, res, { component: 'Links/CancelSyncRequest', props: { page } }),
    page == 3 ? 500 : 0,
  )
})
app.get('/links/scroll-region-list', (req, res) =>
  inertia.render(req, res, {
    component: 'Links/ScrollRegionList',
    props: { user_id: req.query.user_id },
    url: req.originalUrl,
  }),
)
app.get('/links/scroll-region-list/user/:id', (req, res) =>
  res.redirect(303, `/links/scroll-region-list?user_id=${req.params.id}`),
)

app.get('/scroll-region-preserve-url/:page', (req, res) =>
  inertia.render(req, res, {
    component: 'ScrollRegionPreserveUrl',
    props: { page: parseInt(req.params.page) },
  }),
)

app.get('/client-side-visit', (req, res) =>
  inertia.render(req, res, {
    component: 'ClientSideVisit/Page1',
    props: { foo: 'foo from server', bar: 'bar from server' },
  }),
)

app.get('/client-side-visit/props', (req, res) =>
  inertia.render(req, res, {
    component: 'ClientSideVisit/Props',
    props: {
      items: ['item1', 'item2'],
      tags: [
        { id: 1, name: 'tag1' },
        { id: 2, name: 'tag2' },
      ],
      user: { name: 'John Doe', age: 30 },
      count: 5,
      singleValue: 'hello',
      undefinedValue: undefined,
    },
  }),
)

app.get('/client-side-visit/sequential', (req, res) =>
  inertia.render(req, res, {
    component: 'ClientSideVisit/Sequential',
    props: {
      foo: 'foo',
      bar: 'bar',
    },
  }),
)

app.get('/visits/proxy', (req, res) => {
  const timeout = req.headers['x-inertia-partial-data'] ? 250 : 0
  const statuses = ['pending', 'running', 'success', 'failed', 'canceled']

  const sites = [1, 2, 3, 4, 5].map(function (id) {
    const site = { id }

    site.latestDeployment = { id: id * 10, statuses: [statuses[id % statuses.length]] }

    return site
  })

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'Visits/Proxy',
        props: req.headers['x-inertia-partial-data'] === 'sites' ? { sites } : { foo: new Date().toISOString() },
        deferredProps: req.headers['x-inertia-partial-data'] ? {} : { default: ['sites'] },
      }),
    timeout,
  )
})

app.post('/visits/proxy', (req, res) => res.redirect(303, '/visits/proxy'))

app.get('/visits/partial-reloads', (req, res) =>
  inertia.render(req, res, {
    component: 'Visits/PartialReloads',
    props: {
      headers: req.headers,
      foo: Number.parseInt(req.query.foo || 0) + 1,
      bar: (props) => props.foo + 1,
      baz: (props) => props.foo + 2,
    },
  }),
)
app.all('/visits/preserve-state-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Visits/PreserveState', props: { foo: req.query.foo } }),
)
app.all('/visits/preserve-scroll-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Visits/PreserveScroll', props: { foo: req.query.foo } }),
)
app.all('/visits/preserve-scroll-false-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Visits/PreserveScrollFalse', props: { foo: req.query.foo } }),
)
app.post('/visits/events-errors', (req, res) =>
  inertia.render(req, res, { component: 'Visits/Events', props: { errors: { foo: 'bar' } } }),
)
app.get('/visits/headers/version', (req, res) =>
  inertia.render(req, res, { component: 'Visits/Headers', version: 'example-version-header' }),
)
app.get('/visits/after-error/:page', (req, res) => inertia.render(req, res, { component: 'Visits/AfterError' }))

app.post('/remember/form-helper/default', (req, res) =>
  inertia.render(req, res, {
    component: 'Remember/FormHelper/Default',
    props: { errors: { name: 'Some name error', handle: 'The Handle was invalid' } },
  }),
)
app.post('/remember/form-helper/remember', (req, res) =>
  inertia.render(req, res, {
    component: 'Remember/FormHelper/Remember',
    props: { errors: { name: 'Some name error', handle: 'The Handle was invalid' } },
  }),
)

app.post('/form-helper/data', (req, res) =>
  inertia.render(req, res, {
    component: 'FormHelper/Data',
    props: { errors: { name: 'Some name error', handle: 'The Handle was invalid' } },
  }),
)

app.post('/form-helper/data/redirect-back', (req, res) => res.redirect(303, '/form-helper/data'))

app.get('/form-helper/nested', (req, res) =>
  inertia.render(req, res, {
    component: 'FormHelper/Nested',
  }),
)

app.get('/form-helper/dirty', (req, res) =>
  inertia.render(req, res, {
    component: 'FormHelper/Dirty',
    props: {},
  }),
)

app.post('/form-helper/effect-count', (req, res) =>
  inertia.render(req, res, {
    component: 'FormHelper/EffectCount',
  }),
)

app.post('/form-helper/dirty', (req, res) => res.redirect(303, '/form-helper/dirty'))
app.post('/form-helper/dirty/redirect-back', (req, res) => res.redirect(303, '/form-helper/dirty'))

app.post('/form-helper/errors', (req, res) =>
  inertia.render(req, res, {
    component: 'FormHelper/Errors',
    props: { errors: { name: 'Some name error', handle: 'The Handle was invalid' } },
  }),
)

app.get('/form-helper/errors/clear-on-resubmit', (req, res) =>
  inertia.render(req, res, { component: 'FormHelper/ErrorsClearOnResubmit' }),
)

app.post('/form-helper/errors/clear-on-resubmit', (req, res) => {
  const name = req.body['name']
  const handle = req.body['handle']
  const errors = {}

  if (!name || name.length < 3) {
    errors.name = 'The name must be at least 3 characters.'
  }

  if (!handle || handle.length < 3) {
    errors.handle = 'The handle must be at least 3 characters.'
  }

  inertia.render(req, res, {
    component: 'FormHelper/ErrorsClearOnResubmit',
    props: { errors },
  })
})

app.post('/form-helper/events/errors', (req, res) => {
  setTimeout(() => {
    inertia.render(req, res, {
      component: 'FormHelper/Events',
      props: { errors: { name: 'Some name error', handle: 'The Handle was invalid' } },
    })
  }, 250)
})

//
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

app.post('/precognition/default', upload.any(), (req, res) => {
  if (!req.headers['precognition']) {
    return renderDump(req, res)
  }

  setTimeout(
    () => {
      const only = req.headers['precognition-validate-only'] ? req.headers['precognition-validate-only'].split(',') : []
      const name = req.body['name']
      const email = req.body['email']
      const errors = {}

      if (!name) {
        errors.name = 'The name field is required.'
      }

      if (name && name.length < 3) {
        errors.name = 'The name must be at least 3 characters.'
      }

      if (!email) {
        errors.email = 'The email field is required.'
      }

      if (email && !isValidEmail(email)) {
        errors.email = 'The email must be a valid email address.'
      }

      if (only.length) {
        Object.keys(errors).forEach((key) => {
          if (!only.includes(key)) {
            delete errors[key]
          }
        })
      }

      res.header('Precognition', 'true')
      res.header('Vary', 'Precognition')

      if (Object.keys(errors).length) {
        return res.status(422).json({ errors })
      }

      return res.status(204).header('Precognition-Success', 'true').send()
    },
    !!req.query['slow'] ? 2000 : 250,
  )
})

app.post('/precognition/transform-keys', upload.any(), (req, res) => {
  if (!req.headers['precognition']) {
    return renderDump(req, res)
  }

  setTimeout(() => {
    const only = req.headers['precognition-validate-only'] ? req.headers['precognition-validate-only'].split(',') : []
    // After transform, the email is at customer.email (not document.customer.email)
    const email = req.body['customer']?.email
    const errors = {}

    if (!email) {
      errors['customer.email'] = 'The email field is required.'
    }

    if (email && !isValidEmail(email)) {
      errors['customer.email'] = 'The email must be a valid email address.'
    }

    if (only.length) {
      Object.keys(errors).forEach((key) => {
        if (!only.includes(key)) {
          delete errors[key]
        }
      })
    }

    res.header('Precognition', 'true')
    res.header('Vary', 'Precognition')

    if (Object.keys(errors).length) {
      return res.status(422).json({ errors })
    }

    return res.status(204).header('Precognition-Success', 'true').send()
  }, 250)
})

app.post('/precognition/with-all-errors', (req, res) => {
  setTimeout(() => {
    const only = req.headers['precognition-validate-only'] ? req.headers['precognition-validate-only'].split(',') : []
    const name = req.body['name']
    const email = req.body['email']
    const errors = {}

    if (!name) {
      errors.name = ['The name field is required.']
    }

    if (name && name.length < 3) {
      errors.name = ['The name must be at least 3 characters.', 'The name contains invalid characters.']
    }

    if (!email) {
      errors.email = ['The email field is required.']
    }

    if (email && !isValidEmail(email)) {
      errors.email = ['The email must be a valid email address.', 'The email format is incorrect.']
    }

    if (only.length) {
      Object.keys(errors).forEach((key) => {
        if (!only.includes(key)) {
          delete errors[key]
        }
      })
    }

    res.header('Precognition', 'true')
    res.header('Vary', 'Precognition')

    if (Object.keys(errors).length) {
      return res.status(422).json({ errors })
    }

    return res.status(204).header('Precognition-Success', 'true').send()
  }, 250)
})

app.post('/precognition/files', upload.any(), (req, res) => {
  setTimeout(() => {
    const only = req.headers['precognition-validate-only'] ? req.headers['precognition-validate-only'].split(',') : []
    const name = req.body['name']
    const hasAvatar = req.files && req.files.avatar
    const errors = {}

    if (!name) {
      errors.name = 'The name field is required.'
    }

    if (name && name.length < 3) {
      errors.name = 'The name must be at least 3 characters.'
    }

    if (!hasAvatar) {
      errors.avatar = 'The avatar field is required.'
    }

    if (only.length) {
      Object.keys(errors).forEach((key) => {
        if (!only.includes(key)) {
          delete errors[key]
        }
      })
    }

    res.header('Precognition', 'true')
    res.header('Vary', 'Precognition')

    if (Object.keys(errors).length) {
      return res.status(422).json({ errors })
    }

    return res.status(204).header('Precognition-Success', 'true').send()
  }, 250)
})

app.post('/precognition/headers', (req, res) => {
  setTimeout(() => {
    const customHeader = req.headers['x-custom-header']
    const name = req.body['name']
    const errors = {}

    // Show error when custom header IS present (to prove it was sent)
    if (customHeader === 'custom-value') {
      errors.name = 'Custom header received: custom-value'
    } else if (!name) {
      errors.name = 'The name field is required.'
    } else if (name.length < 3) {
      errors.name = 'The name must be at least 3 characters.'
    }

    res.header('Precognition', 'true')
    res.header('Vary', 'Precognition')

    if (Object.keys(errors).length) {
      return res.status(422).json({ errors })
    }

    return res.status(204).header('Precognition-Success', 'true').send()
  }, 250)
})

app.post('/precognition/dynamic-array-inputs', upload.any(), (req, res) => {
  setTimeout(() => {
    const only = req.headers['precognition-validate-only'] ? req.headers['precognition-validate-only'].split(',') : []
    const items = req.body['items'] || []
    const errors = {}

    if (Array.isArray(items)) {
      items.forEach((item, index) => {
        if (!item.name || item.name.length < 3) {
          errors[`items.${index}.name`] = 'The name must be at least 3 characters.'
        }
      })
    }

    if (only.length) {
      Object.keys(errors).forEach((key) => {
        if (!only.includes(key)) {
          delete errors[key]
        }
      })
    }

    res.header('Precognition', 'true')
    res.header('Vary', 'Precognition')

    if (Object.keys(errors).length) {
      return res.status(422).json({ errors })
    }

    return res.status(204).header('Precognition-Success', 'true').send()
  }, 250)
})

app.post('/precognition/error-sync', upload.any(), (req, res) => {
  const isPrecognition = req.headers['precognition'] === 'true'

  setTimeout(() => {
    const only = req.headers['precognition-validate-only'] ? req.headers['precognition-validate-only'].split(',') : []
    const name = req.body['name']
    const email = req.body['email']
    const errors = {}

    // Validate name
    if (!name || name.trim() === '') {
      errors.name = 'The name field is required.'
    }

    // Validate email
    if (!email || email.trim() === '') {
      errors.email = 'The email field is required.'
    } else if (!isValidEmail(email)) {
      errors.email = 'The email must be a valid email address.'
    }

    // For precognition, filter to only requested fields
    if (isPrecognition && only.length) {
      Object.keys(errors).forEach((key) => {
        if (!only.includes(key)) {
          delete errors[key]
        }
      })
    }

    if (isPrecognition) {
      res.header('Precognition', 'true')
      res.header('Vary', 'Precognition')

      if (Object.keys(errors).length) {
        return res.status(422).json({ errors })
      }

      return res.status(204).header('Precognition-Success', 'true').send()
    }

    // Non-precognition: regular form submission with Inertia error response
    // Detect which component to return based on referer
    const referer = req.headers['referer'] || ''
    const isFormHelper = referer.includes('/form-helper/')
    const component = isFormHelper ? 'FormHelper/Precognition/ErrorSync' : 'FormComponent/Precognition/ErrorSync'

    if (Object.keys(errors).length) {
      return inertia.render(req, res, {
        component,
        props: { errors },
      })
    }

    // Success - redirect
    return res.redirect(303, '/')
  }, 100)
})

const methods = ['get', 'post', 'put', 'patch', 'delete']
const renderDump = (req, res) =>
  inertia.render(req, res, {
    component: 'Dump',
    props: {
      headers: req.headers,
      method: req.method?.toLowerCase(),
      form: req.body || {},
      query: req.query,
      files: req.files,
      url: req.originalUrl,
    },
  })

methods.forEach((method) => app[method](`/dump/${method}`, upload.any(), (req, res) => renderDump(req, res)))

app.get('/visits/reload-on-mount', upload.any(), (req, res) => {
  if (req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'Visits/ReloadOnMount',
      props: { name: 'mounted!' },
    })
  }

  inertia.render(req, res, {
    component: 'Visits/ReloadOnMount',
    props: { name: 'not mounted!' },
  })
})

app.get('/persistent-layouts/shorthand/simple/page-a', (req, res) =>
  inertia.render(req, res, { props: { foo: 'bar', baz: 'example' } }),
)
app.get('/persistent-layouts/shorthand/nested/page-a', (req, res) =>
  inertia.render(req, res, { props: { foo: 'bar', baz: 'example' } }),
)

app.get('/default-layout', (req, res) => inertia.render(req, res, { component: 'DefaultLayout/Index' }))
app.get('/default-layout/with-own-layout', (req, res) =>
  inertia.render(req, res, { component: 'DefaultLayout/WithOwnLayout' }),
)
app.get('/default-layout/callback-excluded', (req, res) =>
  inertia.render(req, res, { component: 'DefaultLayout/CallbackExcluded' }),
)

app.get('/layout-props/basic', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/static', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/named', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/navigate', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/nested', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/named-static', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/default', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/persistent-a', (req, res) => inertia.render(req, res, {}))
app.get('/layout-props/persistent-b', (req, res) => inertia.render(req, res, {}))

app.post('/events/errors', (req, res) =>
  inertia.render(req, res, { component: 'Events', props: { errors: { foo: 'bar' } } }),
)

app.get('/poll/hook', (req, res) => inertia.render(req, res, { component: 'Poll/Hook', props: {} }))
app.get('/poll/hook/manual', (req, res) => inertia.render(req, res, { component: 'Poll/HookManual', props: {} }))
app.get('/poll/router/manual', (req, res) => inertia.render(req, res, { component: 'Poll/RouterManual', props: {} }))
app.get('/poll/unchanged-data', (req, res) =>
  inertia.render(req, res, { component: 'Poll/UnchangedData', props: { custom_prop: 'unchanged' } }),
)
app.get('/poll/unchanged-data/encrypted', (req, res) =>
  inertia.render(req, res, {
    component: 'Poll/UnchangedData',
    props: { custom_prop: 'unchanged' },
    encryptHistory: true,
  }),
)

let pollPreserveErrorsState = {}

app.get('/poll/preserve-errors', (req, res) => {
  const errors = { ...pollPreserveErrorsState }
  pollPreserveErrorsState = {}

  inertia.render(req, res, {
    component: 'Poll/PreserveErrors',
    props: {
      time: Date.now(),
    },
    alwaysProps: {
      errors,
    },
  })
})

app.post('/poll/preserve-errors', (req, res) => {
  pollPreserveErrorsState = { name: 'The name field is required.' }
  res.redirect(303, '/poll/preserve-errors')
})

app.get('/prefetch/after-error', (req, res) => {
  inertia.render(req, res, { component: 'Prefetch/AfterError' })
})

app.get('/prefetch/test-page', (req, res) =>
  inertia.render(req, res, {
    component: 'Prefetch/TestPage',
  }),
)

app.get('/prefetch/form', (req, res) =>
  inertia.render(req, res, {
    component: 'Prefetch/Form',
    props: {
      randomValue: Math.floor(Math.random() * 1000000),
    },
  }),
)

app.post('/prefetch/form', (req, res) => res.redirect(303, '/prefetch/form'))
app.post('/prefetch/redirect-back', (req, res) => res.redirect(303, '/prefetch/form'))

app.get('/prefetch/wayfinder', (req, res) => {
  inertia.render(req, res, {
    component: 'Prefetch/Wayfinder',
  })
})

app.get('/prefetch/preserve-state', (req, res) => {
  inertia.render(req, res, {
    component: 'Prefetch/PreserveState',
    props: {
      page: parseInt(req.query.page || '1'),
      timestamp: Date.now(),
    },
  })
})

app.get('/prefetch/:pageNumber', (req, res) => {
  inertia.render(req, res, {
    component: 'Prefetch/Page',
    props: {
      pageNumber: req.params.pageNumber,
      lastLoaded: Date.now(),
    },
  })
})

app.get('/prefetch/swr/:pageNumber', (req, res) => {
  const page = () => {
    inertia.render(req, res, {
      component: 'Prefetch/SWR',
      props: {
        pageNumber: req.params.pageNumber,
        lastLoaded: Date.now(),
      },
    })
  }

  if (req.params.pageNumber === '4' || req.params.pageNumber === '5') {
    setTimeout(page, 1500)
  } else {
    page()
  }
})

app.get('/prefetch/tags/:pageNumber{/:propType}', (req, res) => {
  inertia.render(req, res, {
    component: 'Prefetch/Tags',
    props: {
      pageNumber: req.params.pageNumber,
      lastLoaded: Date.now(),
      propType: req.params.propType || 'array',
    },
  })
})

app.get('/history/:pageNumber', (req, res) => {
  inertia.render(req, res, {
    component: 'History/Page',
    props: {
      pageNumber: req.params.pageNumber,
      multiByte: req.params.pageNumber === '5' ? '😃' : 'n/a',
    },
    encryptHistory: req.params.pageNumber === '3' || req.params.pageNumber === '5',
    clearHistory: req.params.pageNumber === '4',
  })
})

app.get('/history/version/:pageNumber', (req, res) => {
  inertia.render(req, res, {
    component: 'History/Version',
    props: {
      pageNumber: req.params.pageNumber,
    },
    version: req.params.pageNumber === '1' ? 'version-1' : 'version-2',
  })
})

app.get('/history-quota/:pageNumber', (req, res) => {
  const pageNumber = parseInt(req.params.pageNumber)
  const size = 8 * 1024 * 1024 // 8 MB

  const largeData = pageNumber < 8 ? 'x'.repeat(size) : 'x'.repeat(size - 2137)

  inertia.render(req, res, {
    component: 'HistoryQuota/Page',
    props: {
      pageNumber,
      largeData,
    },
  })
})

app.get('/when-visible', (req, res) => {
  const page = () =>
    inertia.render(req, res, {
      component: 'WhenVisible',
      props: {},
    })

  if (req.headers['x-inertia-partial-data'] || req.query.count) {
    setTimeout(page, 250)
  } else {
    page()
  }
})

app.get('/when-visible-reload', (req, res) => {
  const page = () =>
    inertia.render(req, res, {
      component: 'WhenVisibleReload',
      props: {},
    })

  if (req.headers['x-inertia-partial-data']) {
    setTimeout(() => {
      inertia.render(req, res, {
        component: 'WhenVisibleReload',
        props: {
          lazyData: {
            text: 'This is lazy loaded data!',
          },
        },
      })
    }, 250)
  } else {
    page()
  }
})

app.get('/when-visible-array-reload', (req, res) => {
  const page = () =>
    inertia.render(req, res, {
      component: 'WhenVisibleArrayReload',
      props: {},
    })

  if (req.headers['x-inertia-partial-data']) {
    setTimeout(() => {
      inertia.render(req, res, {
        component: 'WhenVisibleArrayReload',
        props: {
          firstData: {
            text: 'First lazy data loaded!',
          },
          secondData: {
            text: 'Second lazy data loaded!',
          },
        },
      })
    }, 250)
  } else {
    page()
  }
})

app.get('/when-visible-back-button', (req, res) => {
  const page = () =>
    inertia.render(req, res, {
      component: 'WhenVisibleBackButton',
      props: {},
    })

  if (req.headers['x-inertia-partial-data']) {
    setTimeout(() => {
      inertia.render(req, res, {
        component: 'WhenVisibleBackButton',
        props: {
          lazyData: {
            text: 'This is lazy loaded data!',
          },
        },
      })
    }, 250)
  } else {
    page()
  }
})

app.get('/when-visible-fetching', (req, res) => {
  if (req.headers['x-inertia-partial-data']) {
    setTimeout(() => {
      inertia.render(req, res, {
        component: 'WhenVisibleFetching',
        props: {
          lazyData: { text: 'Lazy data loaded!' },
        },
      })
    }, 500)
  } else {
    inertia.render(req, res, {
      component: 'WhenVisibleFetching',
      props: {},
    })
  }
})

app.get('/when-visible-merge-params', (req, res) => {
  const partialData = req.headers['x-inertia-partial-data']

  if (partialData) {
    const props = {}
    const partialProps = partialData.split(',')

    if (partialProps.includes('dataOnlyProp')) {
      props.dataOnlyProp = { text: 'Data only success!' }
    }
    if (partialProps.includes('mergedProp')) {
      props.mergedProp = { text: `Merged success! extra=${req.query.extra}` }
    }
    if (partialProps.includes('mergedWithCallbackProp')) {
      props.mergedWithCallbackProp = { text: `Merged with callback success! page=${req.query.page}` }
    }

    setTimeout(() => {
      inertia.render(req, res, {
        component: 'WhenVisibleMergeParams',
        props,
      })
    }, 100)
  } else {
    inertia.render(req, res, {
      component: 'WhenVisibleMergeParams',
      props: {},
    })
  }
})

app.get('/when-visible-params-update', (req, res) => {
  if (req.headers['x-inertia-partial-data']) {
    setTimeout(() => {
      inertia.render(req, res, {
        component: 'WhenVisibleParamsUpdate',
        props: {
          lazyData: { text: `Loaded with paramValue=${req.query.paramValue}` },
        },
      })
    }, 100)
  } else {
    inertia.render(req, res, {
      component: 'WhenVisibleParamsUpdate',
      props: {},
    })
  }
})

let whenVisiblePreserveErrorsState = {}

app.get('/when-visible/preserve-errors', (req, res) => {
  const errors = { ...whenVisiblePreserveErrorsState }
  whenVisiblePreserveErrorsState = {}

  const render = (props) =>
    inertia.render(req, res, {
      component: 'WhenVisiblePreserveErrors',
      props,
      alwaysProps: { errors },
    })

  if (req.headers['x-inertia-partial-data']) {
    setTimeout(() => render({ foo: 'foo value' }), 100)
  } else {
    render({})
  }
})

app.post('/when-visible/preserve-errors', (req, res) => {
  whenVisiblePreserveErrorsState = { name: 'The name field is required.' }
  res.redirect(303, '/when-visible/preserve-errors')
})

app.get('/progress/:pageNumber', (req, res) => {
  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'Progress',
        props: { pageNumber: req.params.pageNumber },
      }),
    500,
  )
})

app.get('/progress-component', (req, res) => inertia.render(req, res, { component: 'ProgressComponent' }))

app.get('/merge-props', (req, res) => {
  inertia.render(req, res, {
    component: 'MergeProps',
    props: {
      bar: new Array(5).fill(1),
      foo: new Array(5).fill(1),
    },
    ...(req.headers['x-inertia-reset'] ? {} : { mergeProps: ['foo'] }),
  })
})

app.get('/merge-nested-props/:strategy', (req, res) => {
  const perPage = 3
  const page = parseInt(req.query.page ?? 1)
  const shouldAppend = req.params.strategy === 'append'

  const users = new Array(perPage).fill(1).map((_, index) => ({
    id: index + 1 + (page - 1) * perPage,
    name: `User ${index + 1 + (page - 1) * perPage}`,
  }))

  inertia.render(req, res, {
    component: 'MergeNestedProps',
    props: {
      users: {
        data: shouldAppend ? users : users.slice().reverse(),
        meta: {
          perPage,
          page,
        },
      },
    },
    ...(req.headers['x-inertia-reset']
      ? {}
      : shouldAppend
        ? { mergeProps: ['users.data'] }
        : { prependProps: ['users.data'] }),
  })
})

app.get('/merge-nested-props-with-match/:strategy', (req, res) => {
  const page = parseInt(req.query.page ?? 1)
  const shouldAppend = req.params.strategy === 'append'

  let users

  if (page === 1) {
    users = (shouldAppend ? [1, 2, 3, 4, 5] : [4, 5, 6, 7, 8]).map((id) => ({ id, name: `User ${id} - initial` }))
  } else {
    users = (shouldAppend ? [4, 5, 6, 7, 8] : [1, 2, 3, 4, 5]).map((id) => ({ id, name: `User ${id} - subsequent` }))
  }

  inertia.render(req, res, {
    component: 'MergeNestedProps',
    props: {
      users: {
        data: users,
        meta: {
          perPage: 5,
          page,
        },
      },
    },
    ...(req.headers['x-inertia-reset']
      ? {}
      : shouldAppend
        ? { mergeProps: ['users.data'], matchPropsOn: ['users.data.id'] }
        : { prependProps: ['users.data'], matchPropsOn: ['users.data.id'] }),
  })
})

app.get('/deep-merge-props', (req, res) => {
  const labels = ['first', 'second', 'third', 'fourth', 'fifth']

  const page = parseInt(req.query.page ?? -1, 10) + 1

  inertia.render(req, res, {
    component: 'DeepMergeProps',
    props: {
      bar: new Array(5).fill(1),
      baz: new Array(5).fill(1),
      foo: {
        data: new Array(5).fill(1),
        page,
        per_page: 5,
        meta: {
          label: labels[page],
        },
      },
    },
    ...(req.headers['x-inertia-reset'] ? {} : { deepMergeProps: ['foo', 'baz'] }),
  })
})

app.get('/complex-merge-selective', (req, res) => {
  const isReload = req.headers['x-inertia-partial-component'] || req.headers['x-inertia-partial-data']

  inertia.render(req, res, {
    component: 'ComplexMergeSelective',
    props: {
      mixed: {
        name: isReload ? 'Jane' : 'John',
        users: isReload ? ['d', 'e', 'f'] : ['a', 'b', 'c'],
        chat: {
          data: isReload ? [4, 5, 6] : [1, 2, 3],
        },
        post: {
          id: 1,
          comments: {
            allowed: isReload ? false : true,
            data: isReload ? ['D', 'E', 'F'] : ['A', 'B', 'C'],
          },
        },
      },
    },
    mergeProps: ['mixed.chat.data', 'mixed.post.comments.data'],
  })
})

app.get('/match-props-on-key', (req, res) => {
  const labels = ['first', 'second', 'third', 'fourth', 'fifth']

  const perPage = 5
  const page = parseInt(req.query.page ?? -1, 10) + 1

  const users = new Array(perPage).fill(1).map((_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
  }))

  const companies = new Array(perPage).fill(1).map((_, index) => ({
    otherId: index + 1,
    name: `Company ${index + 1}`,
  }))

  const teams = new Array(perPage).fill(1).map((_, index) => ({
    uuid: (Math.random() + 1).toString(36).substring(7),
    name: `Team ${perPage * page + index + 1}`,
  }))

  inertia.render(req, res, {
    component: 'MatchPropsOnKey',
    props: {
      bar: new Array(perPage).fill(1),
      baz: new Array(perPage).fill(1),
      foo: {
        data: users,
        companies,
        teams,
        page,
        per_page: 5,
        meta: {
          label: labels[page],
        },
      },
    },
    ...(req.headers['x-inertia-reset']
      ? {}
      : {
          deepMergeProps: ['foo', 'baz'],
          matchPropsOn: ['foo.data.id', 'foo.companies.otherId', 'foo.teams.uuid'],
        }),
  })
})

app.get('/deferred-props/page-1', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/Page1',
      deferredProps: {
        default: ['foo', 'bar'],
      },
      props: {},
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/Page1',
        props: {
          foo: req.headers['x-inertia-partial-data']?.includes('foo') ? { text: 'foo value' } : undefined,
          bar: req.headers['x-inertia-partial-data']?.includes('bar') ? { text: 'bar value' } : undefined,
        },
      }),
    500,
  )
})

app.get('/deferred-props/with-partial-reload/:mode', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/WithPartialReload',
      deferredProps: {
        default: ['users'],
      },
      props: {
        withOnly: (() => {
          if (req.params.mode === 'only') {
            return ['users']
          }

          if (req.params.mode === 'only-other') {
            return ['other']
          }

          return []
        })(),
        withExcept: (() => {
          if (req.params.mode === 'except') {
            return ['users']
          }

          if (req.params.mode === 'except-other') {
            return ['other']
          }

          return []
        })(),
      },
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/WithPartialReload',
        props: {
          users: req.headers['x-inertia-partial-data']?.includes('users') ? [{ id: 1, name: 'John Doe' }] : undefined,
        },
      }),
    500,
  )
})

app.get('/deferred-props/page-2', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/Page2',
      deferredProps: {
        default: ['baz'],
        other: ['qux'],
      },
      props: {},
    })
  }

  if (req.headers['x-inertia-partial-data']?.includes('baz')) {
    setTimeout(
      () =>
        inertia.render(req, res, {
          component: 'DeferredProps/Page2',
          props: {
            baz: 'baz value',
          },
        }),
      500,
    )
  }

  if (req.headers['x-inertia-partial-data']?.includes('qux')) {
    setTimeout(
      () =>
        inertia.render(req, res, {
          component: 'DeferredProps/Page2',
          props: {
            qux: 'qux value',
          },
        }),
      750,
    )
  }
})

app.get('/deferred-props/page-3', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/Page3',
      deferredProps: {
        default: ['alpha', 'beta'],
      },
      props: {},
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/Page3',
        props: {
          alpha: req.headers['x-inertia-partial-data']?.includes('alpha') ? 'alpha value' : undefined,
          beta: req.headers['x-inertia-partial-data']?.includes('beta') ? 'beta value' : undefined,
        },
      }),
    500,
  )
})

app.get('/deferred-props/many-groups', (req, res) => {
  const props = ['foo', 'bar', 'baz', 'qux', 'quux']
  const requestedProps = req.headers['x-inertia-partial-data']
  const delay = requestedProps ? (props.indexOf(requestedProps) + 3) * 100 : 500

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/ManyGroups',
        props: requestedProps ? { [requestedProps]: { text: `${requestedProps} value` } } : {},
        deferredProps: requestedProps
          ? {}
          : props.reduce((groups, prop) => {
              groups[prop] = [prop]
              return groups
            }, {}),
      }),
    delay,
  )
})

app.get('/deferred-props/instant-reload', (req, res) => {
  const requestedProps = req.headers['x-inertia-partial-data']
  const delay = requestedProps === 'bar' ? 500 : 0

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/InstantReload',
        props: requestedProps
          ? {
              [requestedProps]: {
                text: `${requestedProps} value`,
              },
            }
          : {},
        deferredProps: requestedProps ? {} : { default: ['bar'] },
      }),
    delay,
  )
})

app.get('/deferred-props/with-query-params', (req, res) => {
  const filter = req.query.filter || 'none'
  const requestedProps = req.headers['x-inertia-partial-data']

  if (!requestedProps) {
    return inertia.render(req, res, {
      component: 'DeferredProps/WithQueryParams',
      deferredProps: {
        default: ['users'],
      },
      props: {
        filter,
      },
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/WithQueryParams',
        props: {
          users: requestedProps.includes('users') ? { text: `users data for ${filter}` } : undefined,
        },
      }),
    500,
  )
})

app.get('/deferred-props/rapid-navigation{/:id}', (req, res) => {
  const id = req.params.id || 'none'
  const requestedProps = req.headers['x-inertia-partial-data']

  if (!requestedProps) {
    return inertia.render(req, res, {
      component: 'DeferredProps/RapidNavigation',
      deferredProps: {
        group1: ['users'],
        group2: ['stats'],
        group3: ['activity'],
      },
      props: {
        id,
      },
    })
  }

  // Simulate slow deferred prop loading
  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/RapidNavigation',
        props: {
          id,
          users: requestedProps.includes('users') ? { text: `users data for ${id}` } : undefined,
          stats: requestedProps.includes('stats') ? { text: `stats data for ${id}` } : undefined,
          activity: requestedProps.includes('activity') ? { text: `activity data for ${id}` } : undefined,
        },
      }),
    600,
  )
})

app.get('/deferred-props/partial-reloads', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/PartialReloads',
      deferredProps: {
        default: ['foo', 'bar'],
      },
      props: {},
    })
  }

  const requestedProps = req.headers['x-inertia-partial-data']
  const props = {}

  if (requestedProps.includes('foo')) {
    props.foo = {
      timestamp: new Date().toISOString(),
    }
  }

  if (requestedProps.includes('bar')) {
    props.bar = {
      timestamp: new Date().toISOString(),
    }
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/PartialReloads',
        props: props,
      }),
    500,
  )
})

let deferredPropsWithErrorsState = {}

app.get('/deferred-props/with-errors', (req, res) => {
  const errors = { ...deferredPropsWithErrorsState }

  deferredPropsWithErrorsState = {}

  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/WithErrors',
      deferredProps: {
        default: ['foo'],
      },
      props: {
        errors,
      },
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/WithErrors',
        props: {
          foo: req.headers['x-inertia-partial-data']?.includes('foo') ? { text: 'foo value' } : undefined,
          errors: {},
        },
      }),
    250,
  )
})

app.post('/deferred-props/with-errors', (req, res) => {
  deferredPropsWithErrorsState = { name: 'The name field is required.' }

  res.redirect(303, '/deferred-props/with-errors')
})

app.get('/deferred-props/with-reload', (req, res) => {
  const page = parseInt(req.query.page) || 1

  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/WithReload',
      url: req.originalUrl,
      deferredProps: {
        default: ['results'],
      },
      props: {},
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/WithReload',
        url: req.originalUrl,
        props: {
          results: req.headers['x-inertia-partial-data']?.includes('results')
            ? { data: [`Item ${page}-1`, `Item ${page}-2`, `Item ${page}-3`], page }
            : undefined,
        },
      }),
    500,
  )
})

app.get('/deferred-props/reload-without-optional-chaining', (req, res) => {
  const page = parseInt(req.query.page) || 1

  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/ReloadWithoutOptionalChaining',
      url: req.originalUrl,
      deferredProps: {
        default: ['results'],
      },
      props: {},
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/ReloadWithoutOptionalChaining',
        url: req.originalUrl,
        props: {
          results: req.headers['x-inertia-partial-data']?.includes('results')
            ? { data: [`Item ${page}-1`, `Item ${page}-2`, `Item ${page}-3`], page }
            : undefined,
        },
      }),
    300,
  )
})

app.get('/svelte/props-and-page-store', (req, res) =>
  inertia.render(req, res, { component: 'Svelte/PropsAndPageStore', props: { foo: req.query.foo || 'default' } }),
)

app.get('/remember/users', (req, res) => {
  const users = [
    { id: 1, name: 'User One', email: 'user1@example.com' },
    { id: 2, name: 'User Two', email: 'user2@example.com' },
    { id: 3, name: 'User Three', email: 'user3@example.com' },
  ]
  inertia.render(req, res, { component: 'FormHelper/RememberIndex', props: { users } })
})

app.get('/remember/users/:id/edit', (req, res) => {
  const users = {
    1: { id: 1, name: 'User One', email: 'user1@example.com' },
    2: { id: 2, name: 'User Two', email: 'user2@example.com' },
    3: { id: 3, name: 'User Three', email: 'user3@example.com' },
  }
  const user = users[req.params.id]
  inertia.render(req, res, {
    component: 'FormHelper/RememberEdit',
    props: { user },
  })
})

app.get('/preserve-equal-props', (req, res) => {
  inertia.render(req, res, {
    component: 'PreserveEqualProps',
    props: { nestedA: { count: 1 }, nestedB: { date: Date.now() } },
  })
})
app.post('/preserve-equal-props/back', (req, res) => res.redirect(303, '/preserve-equal-props'))

app.all('/sleep', (req, res) => setTimeout(() => res.send(''), 2000))
app.post('/redirect', (req, res) => res.redirect(303, '/dump/get'))

app.get('/redirect-hash', (req, res) => {
  if (req.get('X-Inertia')) {
    return inertia.redirect(res, '/links/url-fragments#target')
  }

  res.redirect('/links/url-fragments#target')
})

app.post('/redirect-hash', (req, res) => {
  if (req.get('X-Inertia')) {
    return inertia.redirect(res, '/links/url-fragments#target')
  }

  res.redirect(303, '/links/url-fragments#target')
})

app.get('/location', ({ res }) => inertia.location(res, '/dump/get'))
app.post('/redirect-external', (req, res) => inertia.location(res, '/non-inertia'))
app.post('/disconnect', (req, res) => res.socket.destroy())
app.post('/json', (req, res) => res.status(200).json({ foo: 'bar' }))

app.get('/form-component/child-component', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ChildComponent' }),
)

let defaultValueForErrors = {}

app.get('/form-component/default-value', (req, res) => {
  const errors = { ...defaultValueForErrors }
  defaultValueForErrors = {}

  return inertia.render(req, res, {
    component: 'FormComponent/DefaultValue',
    props: { user: { name: 'John Doe' }, errors },
  })
})
app.patch('/form-component/default-value', (req, res) => {
  if (!req.body.name || req.body.name.length < 10) {
    defaultValueForErrors = { 'user.name': 'The name must be at least 10 characters.' }
    return res.redirect(303, '/form-component/default-value')
  }

  return res.redirect(303, '/')
})

app.get('/form-component/elements', (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/Elements',
    props: {
      queryStringArrayFormat: req.query.queryStringArrayFormat || 'brackets',
    },
  }),
)
app.get('/form-component/errors', (req, res) => inertia.render(req, res, { component: 'FormComponent/Errors' }))
app.post('/form-component/errors', (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/Errors',
    props: { errors: { name: 'Some name error', handle: 'The Handle was invalid' } },
  }),
)
app.post('/form-component/errors/bag', (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/Errors',
    props: { errors: { bag: { name: 'Some name error', handle: 'The Handle was invalid' } } },
  }),
)

app.get('/form-component/events', (req, res) => inertia.render(req, res, { component: 'FormComponent/Events' }))
app.post('/form-component/events/delay', upload.any(), async (req, res) =>
  setTimeout(() => inertia.render(req, res, { component: 'FormComponent/Events' }), 500),
)
app.get('/form-component/disable-while-processing/:disable', upload.any(), async (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/DisableWhileProcessing',
    props: {
      disable: req.params.disable === 'yes',
    },
  }),
)
app.post('/form-component/disable-while-processing/:disable/submit', upload.any(), async (req, res) =>
  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'FormComponent/DisableWhileProcessing',
        props: {
          disable: req.params.disable === 'yes',
        },
      }),
    500,
  ),
)
app.post('/form-component/events/success', async (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/Events' }),
)
app.post('/form-component/events/errors', async (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/Events',
    props: { errors: { field: 'Something went wrong' } },
  }),
)

app.get('/form-component/headers', (req, res) => inertia.render(req, res, { component: 'FormComponent/Headers' }))
app.get('/form-component/options', (req, res) => inertia.render(req, res, { component: 'FormComponent/Options' }))
app.get('/form-component/progress', (req, res) => inertia.render(req, res, { component: 'FormComponent/Progress' }))
app.post('/form-component/progress', async (req, res) =>
  setTimeout(() => inertia.render(req, res, { component: 'FormComponent/Progress' }), 500),
)

app.get('/form-component/submit-complete/reset', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SubmitComplete/Reset' }),
)
app.get('/form-component/submit-complete/defaults', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SubmitComplete/Defaults' }),
)
app.post('/form-component/submit-complete/reset', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SubmitComplete/Reset' }),
)
app.post('/form-component/submit-complete/defaults', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SubmitComplete/Defaults' }),
)

app.get('/form-component/state', (req, res) => inertia.render(req, res, { component: 'FormComponent/State' }))
app.get('/form-component/dotted-keys', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/DottedKeys' }),
)
app.get('/form-component/ref', (req, res) => inertia.render(req, res, { component: 'FormComponent/Ref' }))
app.get('/form-component/reset', (req, res) => inertia.render(req, res, { component: 'FormComponent/Reset' }))
app.get('/form-component/submit-button', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SubmitButton' }),
)
app.get('/form-component/uppercase-method', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/UppercaseMethod' }),
)

app.get('/form-component/reset-on-error', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ResetAttributes/ResetOnError' }),
)
app.post('/form-component/reset-on-error', (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/ResetAttributes/ResetOnError',
    props: { errors: { name: 'Some name error' } },
  }),
)

app.get('/form-component/reset-on-success', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ResetAttributes/ResetOnSuccess' }),
)
app.post('/form-component/reset-on-success', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ResetAttributes/ResetOnSuccess' }),
)

app.get('/form-component/reset-on-error-fields', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ResetAttributes/ResetOnErrorFields' }),
)
app.post('/form-component/reset-on-error-fields', (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/ResetAttributes/ResetOnErrorFields',
    props: { errors: { name: 'Some name error' } },
  }),
)

app.get('/form-component/reset-on-success-fields', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ResetAttributes/ResetOnSuccessFields' }),
)
app.post('/form-component/reset-on-success-fields', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ResetAttributes/ResetOnSuccessFields' }),
)

app.get('/form-component/set-defaults-on-success', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SetDefaultsOnSuccess' }),
)
app.post('/form-component/set-defaults-on-success', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SetDefaultsOnSuccess' }),
)

app.get('/form-component/url/with/segements', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/EmptyAction' }),
)
app.post('/form-component/url/with/segements', async (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/EmptyAction',
    props: { errors: { name: 'Something went wrong' } },
  }),
)

app.get('/form-component/submit-complete/redirect', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/SubmitComplete/Redirect' }),
)
app.post('/form-component/submit-complete/redirect', (req, res) => res.redirect(303, '/'))
app.post('/form-component/wayfinder', (req, res) => {
  inertia.render(req, res, { component: 'FormComponent/Wayfinder' })
})
app.get('/form-component/invalidate-tags/:propType', (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/InvalidateTags',
    props: { lastLoaded: Date.now(), propType: req.params.propType },
  }),
)
app.post('/form-component/view-transition', (req, res) =>
  inertia.render(req, res, { component: 'ViewTransition/PageB' }),
)
app.get('/form-component/optimistic', (req, res) => {
  const session = getOptimisticSession(req)

  inertia.render(req, res, {
    component: 'FormComponent/Optimistic',
    props: {
      todos: [...session.todos],
    },
  })
})
app.post('/form-component/optimistic', upload.none(), (req, res) => {
  setTimeout(() => {
    const session = getOptimisticSession(req)
    const name = req.body.name?.trim()

    if (!name || name.length < 3) {
      return inertia.render(req, res, {
        url: '/form-component/optimistic',
        component: 'FormComponent/Optimistic',
        props: {
          todos: [...session.todos],
          errors: { name: !name ? 'The name field is required.' : 'The name must be at least 3 characters.' },
        },
      })
    }

    session.todos.push({ id: session.todoId++, name, done: false })
    res.redirect(303, '/form-component/optimistic')
  }, 500)
})

function renderInfiniteScroll(req, res, component, total = 40, orderByDesc = false, perPage = 15) {
  const page = req.query.page ? parseInt(req.query.page) : 1
  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, perPage, total, orderByDesc)

  setTimeout(
    () =>
      inertia.render(req, res, {
        component,
        props: { users: paginated },
        [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'],
        scrollProps: { users: scrollProp },
      }),
    partialReload ? 250 : 0,
  )
}

app.get('/infinite-scroll', (req, res) => inertia.render(req, res, { component: 'InfiniteScroll/Links' }))
app.get('/infinite-scroll-with-link', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/InfiniteScrollWithLink'),
)
app.get('/infinite-scroll/manual', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/Manual'))
app.get('/infinite-scroll/manual-after', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/ManualAfter', 60))
app.get('/infinite-scroll/remember-state', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/RememberState', 60),
)
app.get('/infinite-scroll/toggles', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/Toggles'))
app.get('/infinite-scroll/trigger-both', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/TriggerBoth'))
app.get('/infinite-scroll/trigger-end-buffer', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/TriggerEndBuffer'),
)
app.get('/infinite-scroll/trigger-start-buffer', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/TriggerStartBuffer'),
)
app.get('/infinite-scroll/reverse', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/Reverse', 40, true))
app.get('/infinite-scroll/reverse-short-content', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/ReverseShortContent', 40, true, 5),
)
app.get('/infinite-scroll/manual-reverse', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/ManualReverse', 40, true),
)
app.get('/infinite-scroll/update-query-string', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/UpdateQueryString'),
)
app.get('/infinite-scroll/custom-element', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/CustomElement'))
app.get('/infinite-scroll/preserve-url', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/PreserveUrl'))
app.get('/infinite-scroll/scroll-container', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/ScrollContainer'),
)
app.get('/infinite-scroll/grid', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/Grid', 240, false, 60))
app.get('/infinite-scroll/data-table', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/DataTable', 1000, false, 250),
)
app.get('/infinite-scroll/horizontal-scroll', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/HorizontalScroll'),
)
app.get('/infinite-scroll/overflow-x', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/OverflowX', 150, false, 15),
)
app.get('/infinite-scroll/empty', (req, res) => renderInfiniteScroll(req, res, 'InfiniteScroll/Empty', 0))
app.get('/infinite-scroll/custom-triggers-ref', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/CustomTriggersRef'),
)
app.get('/infinite-scroll/custom-triggers-selector', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/CustomTriggersSelector'),
)
app.get('/infinite-scroll/custom-triggers-ref-object', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/CustomTriggersRefObject'),
)
app.get('/infinite-scroll/programmatic-ref', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/ProgrammaticRef'),
)
app.get('/infinite-scroll/short-content', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/ShortContent', 100, false, 5),
)
app.get('/infinite-scroll/invisible-first-child', (req, res) =>
  renderInfiniteScroll(req, res, 'InfiniteScroll/InvisibleFirstChild'),
)
app.get('/infinite-scroll/reload-unrelated', (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1
  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, 15, 40, false)

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/ReloadUnrelated',
        props: {
          time: Date.now(),
          users: paginated,
        },
        ...(req.headers['x-inertia-partial-data'] === 'users'
          ? { [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'] }
          : {}),
        ...(req.headers['x-inertia-partial-data'] === 'time' ? {} : { scrollProps: { users: scrollProp } }),
      }),
    partialReload ? 250 : 0,
  )
})
app.get('/infinite-scroll/dual-containers', (req, res) => {
  const users1Page = req.query.users1 ? parseInt(req.query.users1) : 1
  const users2Page = req.query.users2 ? parseInt(req.query.users2) : 1
  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'

  const { paginated: users1Paginated, scrollProp: users1ScrollProp } = paginateUsers(
    users1Page,
    15,
    40,
    false,
    'users1',
  )
  const { paginated: users2Paginated, scrollProp: users2ScrollProp } = paginateUsers(
    users2Page,
    15,
    60,
    false,
    'users2',
  )

  const props = {}
  const scrollProps = {}

  if (!partialReload || req.headers['x-inertia-partial-data']?.includes('users1')) {
    props.users1 = users1Paginated
    scrollProps.users1 = users1ScrollProp
  }

  if (!partialReload || req.headers['x-inertia-partial-data']?.includes('users2')) {
    props.users2 = users2Paginated
    scrollProps.users2 = users2ScrollProp
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/DualContainers',
        props,
        [shouldAppend ? 'mergeProps' : 'prependProps']: ['users1.data', 'users2.data'],
        scrollProps,
      }),
    partialReload ? 250 : 0,
  )
})
app.get('/infinite-scroll/dual-sibling', (req, res) => {
  const users1Page = req.query.users1 ? parseInt(req.query.users1) : 1
  const users2Page = req.query.users2 ? parseInt(req.query.users2) : 1
  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'

  const { paginated: users1Paginated, scrollProp: users1ScrollProp } = paginateUsers(
    users1Page,
    15,
    40,
    false,
    'users1',
  )
  const { paginated: users2Paginated, scrollProp: users2ScrollProp } = paginateUsers(
    users2Page,
    15,
    60,
    false,
    'users2',
  )

  const props = {}
  const scrollProps = {}

  if (!partialReload || req.headers['x-inertia-partial-data']?.includes('users1')) {
    props.users1 = users1Paginated
    scrollProps.users1 = users1ScrollProp
  }

  if (!partialReload || req.headers['x-inertia-partial-data']?.includes('users2')) {
    props.users2 = users2Paginated
    scrollProps.users2 = users2ScrollProp
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/DualSibling',
        props,
        [shouldAppend ? 'mergeProps' : 'prependProps']: ['users1.data', 'users2.data'],
        scrollProps,
      }),
    partialReload ? 250 : 0,
  )
})

function renderInfiniteScrollWithTag(req, res, component, total = 40, orderByDesc = false, perPage = 15) {}

app.get('/infinite-scroll/filtering/:preserveState', (req, res) => {
  const filter = req.query.filter || ''
  const search = req.query.search || ''

  let users = getUserNames()

  if (search) {
    users = users.filter((user) => user.toLowerCase().includes(search.toLowerCase()))
  }

  if (filter === 'a-m') {
    users = users.filter((user) => user.toLowerCase() >= 'a' && user.toLowerCase() <= 'm')
  } else if (filter === 'n-z') {
    users = users.filter((user) => user.toLowerCase() >= 'n' && user.toLowerCase() <= 'z')
  }

  const perPage = 15
  const page = req.query.page ? parseInt(req.query.page) : 1

  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, perPage, users.length)

  if (page > 1) {
    users = users.slice((page - 1) * perPage, page * perPage)
  }

  paginated.data = paginated.data.map((user, i) => ({ ...user, name: users[i] }))

  if (req.headers['x-inertia-reset']) {
    scrollProp.reset = true
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/Filtering',
        props: { users: paginated, filter, search, preserveState: req.params.preserveState === 'preserve-state' },
        ...(req.headers['x-inertia-reset'] ? {} : { [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'] }),
        scrollProps: { users: scrollProp },
      }),
    partialReload ? 250 : 0,
  )
})

app.get('/infinite-scroll/filtering-reset', (req, res) => {
  const search = req.query.search || ''

  let users = getUserNames()

  if (search) {
    users = users.filter((user) => user.toLowerCase().includes(search.toLowerCase()))
  }

  const perPage = 15
  const page = req.query.page ? parseInt(req.query.page) : 1

  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, perPage, users.length)

  if (page > 1) {
    users = users.slice((page - 1) * perPage, page * perPage)
  }

  paginated.data = paginated.data.map((user, i) => ({ ...user, name: users[i] }))

  if (req.headers['x-inertia-reset']) {
    scrollProp.reset = true
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/FilteringReset',
        props: { users: paginated, search },
        ...(req.headers['x-inertia-reset'] ? {} : { [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'] }),
        scrollProps: { users: scrollProp },
      }),
    partialReload ? 250 : 0,
  )
})

app.get('/infinite-scroll/filtering-manual', (req, res) => {
  const search = req.query.search || ''
  const perPage = 15
  const page = req.query.page ? parseInt(req.query.page) : 1

  let users = getUserNames()

  if (search) {
    users = users.filter((user) => user.toLowerCase().includes(search.toLowerCase()))
  }

  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, perPage, users.length)

  if (page > 1) {
    users = users.slice((page - 1) * perPage, page * perPage)
  }

  paginated.data = paginated.data.map((user, i) => ({ ...user, name: users[i] }))

  if (req.headers['x-inertia-reset']) {
    scrollProp.reset = true
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/FilteringManual',
        props: { users: paginated, search, preserveState: true },
        ...(req.headers['x-inertia-reset'] ? {} : { [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'] }),
        scrollProps: { users: scrollProp },
      }),
    partialReload ? 250 : 0,
  )
})

// Deferred scroll props test - simulates Inertia::scroll()->defer()
app.get('/infinite-scroll/deferred', (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1
  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, 15, 40, false)

  if (!partialReload) {
    // Initial page load - defer the users prop, no scrollProps yet
    return inertia.render(req, res, {
      component: 'InfiniteScroll/Deferred',
      props: {},
      deferredProps: { default: ['users'] },
    })
  }

  // Deferred props request - send both the data AND scrollProps
  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/Deferred',
        props: { users: paginated },
        [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'],
        scrollProps: { users: scrollProp },
      }),
    250,
  )
})

let infiniteScrollPreserveErrorsState = {}

app.get('/infinite-scroll/preserve-errors', (req, res) => {
  const errors = { ...infiniteScrollPreserveErrorsState }
  infiniteScrollPreserveErrorsState = {}

  const page = req.query.page ? parseInt(req.query.page) : 1
  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, 15, 40, false)

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'InfiniteScroll/PreserveErrors',
        props: {
          users: paginated,
        },
        alwaysProps: { errors },
        [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'],
        scrollProps: { users: scrollProp },
      }),
    partialReload ? 250 : 0,
  )
})

app.post('/infinite-scroll/preserve-errors', (req, res) => {
  infiniteScrollPreserveErrorsState = { name: 'The name field is required.' }
  res.redirect(303, '/infinite-scroll/preserve-errors')
})

app.post('/view-transition/form-errors', (req, res) =>
  inertia.render(req, res, {
    component: 'ViewTransition/FormErrors',
    props: { errors: { name: 'The name field is required.' } },
  }),
)

app.get('/flash/events', (req, res) => inertia.render(req, res, { component: 'Flash/Events' }))
app.post('/flash/events/with-data', (req, res) =>
  inertia.render(req, res, {
    component: 'Flash/Events',
    flash: { foo: 'bar' },
  }),
)
app.post('/flash/events/without-data', (req, res) => inertia.render(req, res, { component: 'Flash/Events' }))
app.get('/flash/client-side-visits', (req, res) => inertia.render(req, res, { component: 'Flash/ClientSideVisits' }))
app.get('/flash/router-flash', (req, res) => inertia.render(req, res, { component: 'Flash/RouterFlash' }))
app.get('/flash/initial', (req, res) =>
  inertia.render(req, res, {
    component: 'Flash/InitialFlash',
    flash: { message: 'Hello from server' },
  }),
)
app.get('/flash/with-infinite-scroll', (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1
  const partialReload = !!req.headers['x-inertia-partial-data']
  const shouldAppend = req.headers['x-inertia-infinite-scroll-merge-intent'] !== 'prepend'
  const { paginated, scrollProp } = paginateUsers(page, 15, 40, false)

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'Flash/WithInfiniteScroll',
        props: { users: paginated },
        [shouldAppend ? 'mergeProps' : 'prependProps']: ['users.data'],
        scrollProps: { users: scrollProp },
        flash: partialReload ? {} : { message: 'Flash with infinite scroll' },
      }),
    partialReload ? 250 : 0,
  )
})
app.get('/flash/with-deferred', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'Flash/WithDeferred',
      deferredProps: {
        default: ['data'],
      },
      props: {},
      flash: { message: 'Flash with deferred' },
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'Flash/WithDeferred',
        props: {
          data: req.headers['x-inertia-partial-data']?.includes('data') ? 'Deferred data loaded' : undefined,
        },
      }),
    250,
  )
})
app.get('/flash/partial', (req, res) => {
  const count = parseInt(req.query.count || '0')
  const flashType = req.query.flashType || 'same'

  let flash = { message: 'Initial flash' }
  if (req.headers['x-inertia-partial-data']) {
    flash = flashType === 'different' ? { message: `Updated flash ${count}` } : { message: 'Initial flash' }
  }

  inertia.render(req, res, {
    component: 'Flash/Partial',
    props: { count },
    flash,
  })
})
const getOncePropsData = (req, prop = 'foo') => {
  const isInertiaRequest = !!req.headers['x-inertia']
  const partialData = req.headers['x-inertia-partial-data']?.split(',') ?? []
  const loadedOnceProps = req.headers['x-inertia-except-once-props']?.split(',') ?? []
  const isPartialRequest = partialData.includes(prop)
  const hasPropAlready = loadedOnceProps.includes(prop)
  const shouldResolveProp = !isInertiaRequest || isPartialRequest || !hasPropAlready

  return {
    isInertiaRequest,
    partialData,
    loadedOnceProps,
    isPartialRequest,
    hasPropAlready,
    shouldResolveProp,
  }
}

app.get('/once-props/page-a', (req, res) => {
  const { shouldResolveProp } = getOncePropsData(req)

  inertia.render(req, res, {
    component: 'OnceProps/PageA',
    props: {
      foo: shouldResolveProp ? 'foo-a-' + Date.now() : undefined,
      bar: 'bar-a',
    },
    onceProps: { foo: { prop: 'foo', expiresAt: null } },
  })
})

app.get('/once-props/page-b', (req, res) => {
  const { shouldResolveProp } = getOncePropsData(req)

  inertia.render(req, res, {
    component: 'OnceProps/PageB',
    props: {
      foo: shouldResolveProp ? 'foo-b-' + Date.now() : undefined,
      bar: 'bar-b',
    },
    onceProps: { foo: { prop: 'foo', expiresAt: null } },
  })
})

app.get('/once-props/page-c', (req, res) => {
  inertia.render(req, res, {
    component: 'OnceProps/PageC',
  })
})

app.get('/once-props/page-d', (req, res) => {
  const { shouldResolveProp } = getOncePropsData(req)

  inertia.render(req, res, {
    component: 'OnceProps/PageD',
    props: {
      foo: shouldResolveProp ? 'foo-d-' + Date.now() : undefined,
      bar: 'bar-d',
    },
    onceProps: { foo: { prop: 'foo', expiresAt: null } },
  })
})

app.get('/once-props/page-e', (req, res) => {
  const { shouldResolveProp } = getOncePropsData(req)

  inertia.render(req, res, {
    component: 'OnceProps/PageE',
    props: {
      foo: shouldResolveProp ? 'foo-e-' + Date.now() : undefined,
      bar: 'bar-e',
    },
    onceProps: { foo: { prop: 'foo', expiresAt: null } },
  })
})

app.get('/once-props/partial-reload/:page', (req, res) => {
  const page = req.params.page
  const fooData = getOncePropsData(req, 'foo')
  const barData = getOncePropsData(req, 'bar')

  const isPartialReload = fooData.partialData.length > 0
  const onceProps = {}

  if (!isPartialReload || fooData.isPartialRequest) {
    onceProps.foo = { prop: 'foo', expiresAt: null }
  }

  if (!isPartialReload || barData.isPartialRequest) {
    onceProps.bar = { prop: 'bar', expiresAt: null }
  }

  inertia.render(req, res, {
    component: `OnceProps/PartialReload${page.toUpperCase()}`,
    props: {
      foo: fooData.shouldResolveProp ? `foo-${page}-` + Date.now() : undefined,
      bar: barData.shouldResolveProp ? `bar-${page}-` + Date.now() : undefined,
    },
    onceProps,
  })
})

app.get('/once-props/deferred/:page', (req, res) => {
  const { isPartialRequest, hasPropAlready } = getOncePropsData(req)
  const page = req.params.page

  if (isPartialRequest) {
    return setTimeout(() => {
      inertia.render(req, res, {
        component: `OnceProps/DeferredPage${page.toUpperCase()}`,
        props: {
          foo: { text: `foo-${page}-` + Date.now() },
          bar: `bar-${page}`,
        },
        onceProps: { foo: { prop: 'foo', expiresAt: null } },
      })
    }, 250)
  }

  inertia.render(req, res, {
    component: `OnceProps/DeferredPage${page.toUpperCase()}`,
    props: {
      bar: `bar-${page}`,
    },
    deferredProps: hasPropAlready ? {} : { default: ['foo'] },
    onceProps: { foo: { prop: 'foo', expiresAt: null } },
  })
})

app.get('/once-props/slow-deferred/:page', (req, res) => {
  const fooData = getOncePropsData(req, 'foo')
  const barData = getOncePropsData(req, 'bar')
  const page = req.params.page

  // foo is deferred (slow), bar is not
  if (fooData.isPartialRequest) {
    return setTimeout(() => {
      inertia.render(req, res, {
        component: `OnceProps/SlowDeferredPage${page.toUpperCase()}`,
        props: {
          foo: `foo-${page}-` + Date.now(),
          bar: barData.shouldResolveProp ? `bar-${page}-` + Date.now() : undefined,
        },
        onceProps: {
          foo: { prop: 'foo', expiresAt: null },
          bar: { prop: 'bar', expiresAt: null },
        },
      })
    }, 1000)
  }

  inertia.render(req, res, {
    component: `OnceProps/SlowDeferredPage${page.toUpperCase()}`,
    props: {
      bar: barData.shouldResolveProp ? `bar-${page}-` + Date.now() : undefined,
    },
    deferredProps: fooData.hasPropAlready ? {} : { default: ['foo'] },
    onceProps: {
      foo: { prop: 'foo', expiresAt: null },
      bar: { prop: 'bar', expiresAt: null },
    },
  })
})

app.get('/once-props/ttl/:page', (req, res) => {
  const { shouldResolveProp } = getOncePropsData(req)
  const page = req.params.page
  const expiresAt = Date.now() + 2000

  inertia.render(req, res, {
    component: `OnceProps/TtlPage${page.toUpperCase()}`,
    props: {
      foo: shouldResolveProp ? `foo-${page}-` + Date.now() : undefined,
      bar: `bar-${page}`,
    },
    onceProps: { foo: { prop: 'foo', expiresAt } },
  })
})

app.get('/once-props/optional/:page', (req, res) => {
  const { isPartialRequest, hasPropAlready } = getOncePropsData(req)
  const page = req.params.page

  inertia.render(req, res, {
    component: `OnceProps/OptionalPage${page.toUpperCase()}`,
    props: {
      foo: isPartialRequest ? `foo-${page}-` + Date.now() : undefined,
      bar: `bar-${page}`,
    },
    onceProps: isPartialRequest || hasPropAlready ? { foo: { prop: 'foo', expiresAt: null } } : {},
  })
})

app.get('/once-props/merge/:page', (req, res) => {
  const { shouldResolveProp } = getOncePropsData(req, 'items')
  const page = req.params.page

  inertia.render(req, res, {
    component: `OnceProps/MergePage${page.toUpperCase()}`,
    props: {
      items: shouldResolveProp ? new Array(3).fill(page) : undefined,
      bar: `bar-${page}`,
    },
    mergeProps: ['items'],
    onceProps: { items: { prop: 'items', expiresAt: null } },
  })
})

app.get('/once-props/custom-key/:page', (req, res) => {
  const page = req.params.page
  const propName = page === 'a' ? 'userPermissions' : 'permissions'
  const { shouldResolveProp } = getOncePropsData(req, 'user-permissions')

  inertia.render(req, res, {
    component: `OnceProps/CustomKeyPage${page.toUpperCase()}`,
    props: {
      [propName]: shouldResolveProp ? `perms-${page}-` + Date.now() : undefined,
      bar: `bar-${page}`,
    },
    onceProps: { 'user-permissions': { prop: propName, expiresAt: null } },
  })
})

app.get('/once-props/client-side-visit', (req, res) => {
  const { shouldResolveProp } = getOncePropsData(req)

  inertia.render(req, res, {
    component: 'OnceProps/ClientSideVisit',
    props: {
      foo: shouldResolveProp ? 'foo-initial' : undefined,
      bar: 'bar-initial',
    },
    onceProps: { foo: { prop: 'foo', expiresAt: null } },
  })
})

app.get('/deferred-props/back-button/a', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/BackButton/PageA',
      deferredProps: {
        fast: ['fastProp'],
        slow: ['slowProp'],
      },
      props: {},
    })
  }

  const delay = req.headers['x-inertia-partial-data']?.includes('fastProp') ? 100 : 600

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/BackButton/PageA',
        props: {
          fastProp: req.headers['x-inertia-partial-data']?.includes('fastProp') ? 'Fast prop loaded' : undefined,
          slowProp: req.headers['x-inertia-partial-data']?.includes('slowProp') ? 'Slow prop loaded' : undefined,
        },
      }),
    delay,
  )
})

app.get('/deferred-props/back-button/b', (req, res) => {
  if (!req.headers['x-inertia-partial-data']) {
    return inertia.render(req, res, {
      component: 'DeferredProps/BackButton/PageB',
      deferredProps: {
        default: ['data'],
      },
      props: {},
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'DeferredProps/BackButton/PageB',
        props: {
          data: req.headers['x-inertia-partial-data']?.includes('data') ? 'Page B data loaded' : undefined,
        },
      }),
    400,
  )
})

app.get('/reload/concurrent', (req, res) => {
  const partialData = req.headers['x-inertia-partial-data']

  if (!partialData) {
    return inertia.render(req, res, {
      component: 'Reload/Concurrent',
      props: {
        foo: 'initial foo',
        bar: 'initial bar',
      },
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'Reload/Concurrent',
        props: {
          foo: partialData.includes('foo') ? `foo reloaded at ${Date.now()}` : undefined,
          bar: partialData.includes('bar') ? `bar reloaded at ${Date.now()}` : undefined,
        },
      }),
    600,
  )
})

// JSON API endpoints for useHttp testing
app.get('/api/data', (req, res) => {
  res.json({
    items: ['apple', 'banana', 'cherry'],
    total: 3,
    query: req.query.query || null,
  })
})

app.post('/api/users', upload.none(), (req, res) => {
  res.json({
    success: true,
    id: 123,
    user: {
      name: req.body.name,
      email: req.body.email,
    },
  })
})

app.post('/api/validate', upload.none(), (req, res) => {
  const errors = {}

  if (!req.body.name || req.body.name.trim() === '') {
    errors.name = ['The name field is required.']
  }

  if (!req.body.email || !req.body.email.includes('@')) {
    errors.email = ['The email field must be a valid email address.']
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ errors })
  }

  res.json({ success: true })
})

app.post('/api/validate-multiple', upload.none(), (req, res) => {
  res.status(422).json({
    errors: {
      name: ['The name field is required.', 'The name must be at least 3 characters.'],
      email: ['The email field is required.', 'The email must be a valid email address.'],
    },
  })
})

app.delete('/api/users/:id', (req, res) => {
  res.json({
    success: true,
    deleted: parseInt(req.params.id),
  })
})

app.put('/api/users/:id', upload.none(), (req, res) => {
  res.json({
    success: true,
    id: parseInt(req.params.id),
    user: {
      name: req.body.name,
      email: req.body.email,
    },
  })
})

app.patch('/api/users/:id', upload.none(), (req, res) => {
  res.json({
    success: true,
    id: parseInt(req.params.id),
    user: {
      name: req.body.name,
      email: req.body.email,
    },
  })
})

app.get('/api/slow', (req, res) => {
  setTimeout(() => {
    res.json({ result: 'slow response' })
  }, 2000)
})

app.post('/api/error', upload.none(), (req, res) => {
  res.status(500).json({ message: 'Internal server error' })
})

app.post('/api/optimistic-todo', upload.none(), (req, res) => {
  setTimeout(() => {
    const name = req.body.name?.trim()

    if (!name) {
      return res.status(422).json({ errors: { name: 'The name field is required.' } })
    }

    res.json({ success: true, id: Date.now(), name })
  }, 500)
})

// File upload endpoint
app.post('/api/upload', upload.any(), (req, res) => {
  const files = (req.files || []).map((file) => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  }))

  res.json({
    success: true,
    files,
    fileCount: files.length,
    formData: req.body,
  })
})

// Headers dump endpoint
app.all('/api/headers', upload.none(), (req, res) => {
  res.json({
    headers: req.headers,
    method: req.method.toLowerCase(),
  })
})

// Nested data endpoint
app.post('/api/nested', upload.none(), (req, res) => {
  res.json({
    success: true,
    received: req.body,
  })
})

// Transform endpoint
app.post('/api/transform', upload.none(), (req, res) => {
  res.json({
    success: true,
    received: req.body,
  })
})

// Lifecycle callbacks test endpoint
app.post('/api/lifecycle', upload.none(), (req, res) => {
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Lifecycle test complete',
      received: req.body,
    })
  }, 100)
})

// Lifecycle callbacks test endpoint that returns validation error
app.post('/api/lifecycle-error', upload.none(), (req, res) => {
  setTimeout(() => {
    res.status(422).json({
      errors: {
        field: ['Validation error for lifecycle test'],
      },
    })
  }, 100)
})

// Slow upload endpoint for progress testing
app.post('/api/slow-upload', upload.any(), (req, res) => {
  setTimeout(() => {
    const files = (req.files || []).map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      size: file.size,
    }))

    res.json({
      success: true,
      files,
    })
  }, 500)
})

// Mixed content endpoint (files + nested data)
app.post('/api/mixed', upload.any(), (req, res) => {
  const files = (req.files || []).map((file) => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  }))

  res.json({
    success: true,
    files,
    fileCount: files.length,
    formData: req.body,
  })
})

app.get('/use-http', (req, res) => inertia.render(req, res, { component: 'UseHttp/Index' }))
app.get('/use-http/methods', (req, res) => inertia.render(req, res, { component: 'UseHttp/Methods' }))
app.get('/use-http/file-upload', (req, res) => inertia.render(req, res, { component: 'UseHttp/FileUpload' }))
app.get('/use-http/headers', (req, res) => inertia.render(req, res, { component: 'UseHttp/Headers' }))
app.get('/use-http/nested-data', (req, res) => inertia.render(req, res, { component: 'UseHttp/NestedData' }))
app.get('/use-http/transform', (req, res) => inertia.render(req, res, { component: 'UseHttp/Transform' }))
app.get('/use-http/lifecycle', (req, res) => inertia.render(req, res, { component: 'UseHttp/Lifecycle' }))
app.get('/use-http/mixed-content', (req, res) => inertia.render(req, res, { component: 'UseHttp/MixedContent' }))
app.get('/use-http/remember', (req, res) => inertia.render(req, res, { component: 'UseHttp/Remember' }))
app.get('/use-http/submit', (req, res) => inertia.render(req, res, { component: 'UseHttp/Submit' }))
app.get('/use-http/optimistic', (req, res) => inertia.render(req, res, { component: 'UseHttp/Optimistic' }))
app.get('/use-http/with-all-errors', (req, res) => inertia.render(req, res, { component: 'UseHttp/WithAllErrors' }))

app.get('/reload/concurrent-with-data', (req, res) => {
  const partialData = req.headers['x-inertia-partial-data']
  const timeframe = req.query.timeframe || 'day'

  if (!partialData) {
    return inertia.render(req, res, {
      component: 'Reload/ConcurrentWithData',
      props: {
        foo: 'initial foo',
        bar: 'initial bar',
        timeframe,
      },
    })
  }

  setTimeout(
    () =>
      inertia.render(req, res, {
        component: 'Reload/ConcurrentWithData',
        props: {
          foo: partialData.includes('foo') ? `foo reloaded (${timeframe}) at ${Date.now()}` : undefined,
          bar: partialData.includes('bar') ? `bar reloaded (${timeframe}) at ${Date.now()}` : undefined,
          timeframe,
        },
      }),
    600,
  )
})

app.get('/preserve-fragment', (req, res) =>
  inertia.render(req, res, {
    component: 'PreserveFragment',
  }),
)

app.get('/preserve-fragment/redirect', (req, res) => res.redirect(303, '/preserve-fragment/target'))

app.get('/preserve-fragment/target', (req, res) =>
  inertia.render(req, res, {
    component: 'PreserveFragment/Target',
    preserveFragment: true,
  }),
)

app.get('/http-handlers', (req, res) => inertia.render(req, res, { component: 'HttpHandlers', props: {} }))

app.get('/http-handlers/error', (req, res) => {
  res.status(500).send('Internal Server Error')
})

// Optimistic updates (state scoped per session cookie to avoid cross-worker interference)
const optimisticSessions = {}

function getDefaultTodos() {
  return [
    { id: 1, name: 'Learn Inertia.js', done: true },
    { id: 2, name: 'Build something awesome', done: false },
  ]
}

function getOptimisticSession(req) {
  const cookies = req.headers.cookie || ''
  const match = cookies.match(/optimistic-session=([^;]+)/)
  const sessionId = match ? match[1] : 'default'

  if (!optimisticSessions[sessionId]) {
    optimisticSessions[sessionId] = { todoId: 3, todos: getDefaultTodos() }
  }

  return optimisticSessions[sessionId]
}

app.get('/optimistic', (req, res) => {
  const session = getOptimisticSession(req)

  inertia.render(req, res, {
    component: 'Optimistic',
    props: {
      todos: [...session.todos],
      likes: session.likes || 0,
      foo: session.foo || 'bar',
    },
  })
})

app.post('/optimistic/todos', (req, res) => {
  setTimeout(() => {
    const session = getOptimisticSession(req)
    const name = req.body.name?.trim()

    if (!name || name.length < 3) {
      return inertia.render(req, res, {
        url: '/optimistic',
        component: 'Optimistic',
        props: {
          todos: [...session.todos],
          errors: { name: !name ? 'The name field is required.' : 'The name must be at least 3 characters.' },
          serverTimestamp: Date.now(),
        },
      })
    }

    session.todos.push({ id: session.todoId++, name, done: false })
    res.redirect(303, '/optimistic')
  }, 500)
})

app.patch('/optimistic/todos/:id', (req, res) => {
  setTimeout(() => {
    const session = getOptimisticSession(req)
    const todo = session.todos.find((t) => t.id === parseInt(req.params.id))

    if (todo) {
      if (req.body.done !== undefined) {
        todo.done = req.body.done === 'true' || req.body.done === true
      }
    }

    res.redirect(303, '/optimistic')
  }, 500)
})

app.delete('/optimistic/todos/:id', (req, res) => {
  setTimeout(() => {
    const session = getOptimisticSession(req)
    session.todos = session.todos.filter((t) => t.id !== parseInt(req.params.id))
    res.redirect(303, '/optimistic')
  }, 500)
})

app.post('/optimistic/clear', (req, res) => {
  const session = getOptimisticSession(req)
  session.todoId = 3
  session.todos = getDefaultTodos()
  res.redirect(303, '/optimistic')
})

app.post('/optimistic/server-error', (req, res) => {
  setTimeout(() => {
    res.status(500).send('Internal Server Error')
  }, 500)
})

app.post('/optimistic/like', (req, res) => {
  const delay = parseInt(req.query.delay || '0')

  setTimeout(() => {
    const session = getOptimisticSession(req)
    session.likes = (session.likes || 0) + 1
    res.redirect(303, '/optimistic')
  }, delay)
})

app.post('/optimistic/like-controlled', (req, res) => {
  const delay = parseInt(req.query.delay || '0')
  const likes = parseInt(req.query.likes || '0')
  const foo = req.query.foo || undefined
  const session = getOptimisticSession(req)

  setTimeout(() => {
    inertia.render(req, res, {
      component: 'Optimistic',
      url: '/optimistic',
      props: {
        todos: [...session.todos],
        likes,
        foo: foo || session.foo || 'bar',
      },
    })
  }, delay)
})

app.post('/optimistic/like-error', (req, res) => {
  const delay = parseInt(req.query.delay || '0')
  const session = getOptimisticSession(req)

  setTimeout(() => {
    inertia.render(req, res, {
      component: 'Optimistic',
      url: '/optimistic',
      props: {
        todos: [...session.todos],
        likes: session.likes || 0,
        foo: session.foo || 'bar',
        errors: { likes: 'Something went wrong' },
      },
    })
  }, delay)
})

app.post('/optimistic', (req, res) => {
  const delay = parseInt(req.query.delay || '0')
  const session = getOptimisticSession(req)

  setTimeout(() => {
    session.likes = (session.likes || 0) + 1
    res.redirect(303, '/optimistic')
  }, delay)
})

app.post('/optimistic/like-and-redirect', (req, res) => {
  const delay = parseInt(req.query.delay || '0')
  const session = getOptimisticSession(req)

  setTimeout(() => {
    session.likes = (session.likes || 0) + 1
    res.redirect(303, '/dump/get')
  }, delay)
})

app.post('/optimistic/reset-likes', (req, res) => {
  const session = getOptimisticSession(req)
  session.likes = 0
  res.redirect(303, '/optimistic')
})

app.get('/use-page/page1', (req, res) =>
  inertia.render(req, res, {
    component: 'UsePage/Page1',
    props: { name: 'Alice' },
  }),
)

app.get('/use-page/page2', (req, res) =>
  inertia.render(req, res, {
    component: 'UsePage/Page2',
    props: { title: 'Dashboard' },
  }),
)

app.all('*page', (req, res) => inertia.render(req, res))

// Send errors to the console (instead of crashing the server)
app.use((err, req, res, next) => {
  console.error('❌ Express Error:', err)
  res.status(500).send('Internal Server Error')
})

const adapterPorts = {
  vue3: 13715,
  react: 13716,
  svelte: 13717,
}

showServerStatus(inertia.package, adapterPorts[inertia.package])

app.listen(adapterPorts[inertia.package])
