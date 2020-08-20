import inertia from './app'

const defaultConfig = {
  resolve: null,
  app: null,
  path: 'Pages',
}

/**
 * Returns an Inertia-ready render function.
 */
export function renderInertia(options) {
  const { path, app, resolve } = {
    ...defaultConfig,
    ...options,
  }

  const { dataset } = app ?? document.getElementById('app')

  return (h) =>
    h(inertia, {
      props: {
        initialPage: JSON.parse(dataset.page),
        resolveComponent: async (component) => {
          return (await resolve(`${path}/${component}`)).default
        },
      },
    })
}
