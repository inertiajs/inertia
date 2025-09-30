const path = require('path')
const express = require('express')
const inertia = require('./helpers')
const bodyParser = require('body-parser')
const multer = require('multer')
const { showServerStatus } = require('./server-status')
const { getUserNames, paginateUsers } = require('./eloquent')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))
const upload = multer()

const adapters = ['react', 'svelte', 'vue3']

if (!adapters.includes(inertia.package)) {
  throw new Error(`Invalid adapter package "${inertia.package}". Expected one of: ${adapters.join(', ')}.`)
}

// Used because Cypress does not allow you to navigate to a different origin URL within a single test.
app.all('/non-inertia', (req, res) => res.send('This is a page that does not have the Inertia app loaded.'))

// Intercepts all .js assets (including files loaded via code splitting)
app.get(/.*\.js$/, (req, res) =>
  res.sendFile(path.resolve(__dirname, '../../packages/', inertia.package, 'test-app/dist', req.path.substring(1))),
)

/**
 * Used for testing the Inertia plugin is registered.
 * @see plugin.test.js
 */
app.get('/plugin/*', (req, res) =>
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
app.all('/links/preserve-state-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Links/PreserveState', props: { foo: req.query.foo } }),
)
app.all('/links/preserve-scroll-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Links/PreserveScroll', props: { foo: req.query.foo } }),
)
app.all('/links/preserve-scroll-false-page-two', (req, res) =>
  inertia.render(req, res, { component: 'Links/PreserveScrollFalse', props: { foo: req.query.foo } }),
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

app.post('/form-helper/events/errors', (req, res) => {
  setTimeout(() => {
    inertia.render(req, res, {
      component: 'FormHelper/Events',
      props: { errors: { name: 'Some name error', handle: 'The Handle was invalid' } },
    })
  }, 250)
})

const methods = ['get', 'post', 'put', 'patch', 'delete']

methods.forEach((method) =>
  app[method](`/dump/${method}`, upload.any(), (req, res) =>
    inertia.render(req, res, {
      component: 'Dump',
      props: {
        headers: req.headers,
        method,
        form: req.body,
        query: req.query,
        files: req.files,
        url: req.originalUrl,
      },
    }),
  ),
)

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

app.post('/events/errors', (req, res) =>
  inertia.render(req, res, { component: 'Events', props: { errors: { foo: 'bar' } } }),
)

app.get('/poll/hook', (req, res) => inertia.render(req, res, { component: 'Poll/Hook', props: {} }))
app.get('/poll/hook/manual', (req, res) => inertia.render(req, res, { component: 'Poll/HookManual', props: {} }))
app.get('/poll/router/manual', (req, res) => inertia.render(req, res, { component: 'Poll/RouterManual', props: {} }))

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

app.get('/prefetch/tags/:pageNumber/:propType?', (req, res) => {
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
  const delay = requestedProps === 'bar' ? 300 : 0

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

app.get('/svelte/props-and-page-store', (req, res) =>
  inertia.render(req, res, { component: 'Svelte/PropsAndPageStore', props: { foo: req.query.foo || 'default' } }),
)

app.all('/sleep', (req, res) => setTimeout(() => res.send(''), 2000))
app.post('/redirect', (req, res) => res.redirect(303, '/dump/get'))
app.get('/location', ({ res }) => inertia.location(res, '/dump/get'))
app.post('/redirect-external', (req, res) => inertia.location(res, '/non-inertia'))
app.post('/disconnect', (req, res) => res.socket.destroy())
app.post('/json', (req, res) => res.json({ foo: 'bar' }))

app.get('/form-component/child-component', (req, res) =>
  inertia.render(req, res, { component: 'FormComponent/ChildComponent' }),
)
app.get('/form-component/elements', (req, res) => inertia.render(req, res, { component: 'FormComponent/Elements' }))
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
app.get('/form-component/options', (req, res) =>
  // TODO: see 'url' key in helpers.js, this should be req.originalUrl by default
  inertia.render(req, res, { component: 'FormComponent/Options', url: req.originalUrl }),
)
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
app.post('/form-component/submit-complete/redirect', (req, res) => res.redirect('/'))
app.post('/form-component/wayfinder', (req, res) => {
  inertia.render(req, res, { component: 'FormComponent/Wayfinder' })
})
app.get('/form-component/invalidate-tags/:propType', (req, res) =>
  inertia.render(req, res, {
    component: 'FormComponent/InvalidateTags',
    props: { lastLoaded: Date.now(), propType: req.params.propType },
  }),
)

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

app.all('*', (req, res) => inertia.render(req, res))

const adapterPorts = {
  vue3: 13715,
  react: 13716,
  svelte: 13717,
}

showServerStatus(inertia.package, adapterPorts[inertia.package])

app.listen(adapterPorts[inertia.package])
