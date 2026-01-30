const path = require('path')
const fs = require('fs')

const package = process.env.PACKAGE || 'vue3'

const ssr = require('./ssr')

const buildPageData = (req, data) => ({
  component: req.path
    .slice(1)
    .split('/')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('/')
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(''),
  props: {},
  url: req.originalUrl,
  version: null,
  ...data,
})

const processPartialProps = (req, data) => {
  const partialDataHeader = req.headers['x-inertia-partial-data'] || ''
  const partialExceptHeader = req.headers['x-inertia-partial-except'] || ''
  const partialComponentHeader = req.headers['x-inertia-partial-component'] || ''

  const isPartial = partialComponentHeader && partialComponentHeader === data.component

  data.props = Object.keys(data.props)
    .filter((key) => !isPartial || !partialDataHeader || partialDataHeader.split(',').indexOf(key) > -1)
    .filter((key) => !isPartial || !partialExceptHeader || partialExceptHeader.split(',').indexOf(key) == -1)
    .reduce((carry, key) => {
      carry[key] = typeof data.props[key] === 'function' ? data.props[key](data.props) : data.props[key]

      return carry
    }, {})

  return data
}

module.exports = {
  package,
  render: (req, res, data) => {
    data = buildPageData(req, data)

    if (data.component.startsWith('InfiniteScroll') && req.query.absolutePageUrl) {
      // Support absolute URL format for testing URL preservation
      const protocol = req.protocol
      const host = req.get('host')
      data.url = `${protocol}://${host}${req.originalUrl}`
    }

    data = processPartialProps(req, data)

    if (req.get('X-Inertia')) {
      res.header('Vary', 'Accept')
      res.header('X-Inertia', true)
      return res.status(200).json(data)
    }

    return res.status(200).send(
      fs
        .readFileSync(path.resolve(__dirname, '../../packages/', package, 'test-app/dist/index.html'))
        .toString()
        .replace('{{ headAttribute }}', data.component === 'Head/Dataset' ? 'data-inertia' : 'inertia')
        .replace("'{{ placeholder }}'", JSON.stringify(data)),
    )
  },
  renderUnified: (req, res, data) => {
    data = buildPageData(req, data)
    data = processPartialProps(req, data)

    if (req.get('X-Inertia')) {
      res.header('Vary', 'Accept')
      res.header('X-Inertia', true)
      return res.status(200).json(data)
    }

    // Escape for HTML attribute (configureInertiaApp reads from data-page attribute)
    const escapedData = JSON.stringify(data).replace(/"/g, '&quot;')

    return res.status(200).send(
      fs
        .readFileSync(path.resolve(__dirname, '../../packages/', package, 'test-app/dist/index-unified.html'))
        .toString()
        .replace('{{ headAttribute }}', data.component === 'Head/Dataset' ? 'data-inertia' : 'inertia')
        .replace('{{ placeholder }}', escapedData),
    )
  },
  renderSSR: async (req, res, data) => {
    data = buildPageData(req, data)

    if (req.get('X-Inertia')) {
      res.header('Vary', 'Accept')
      res.header('X-Inertia', true)
      return res.status(200).json(data)
    }

    const ssrResult = await ssr.render(data)
    const htmlTemplate = fs
      .readFileSync(path.resolve(__dirname, '../../packages/', package, 'test-app/dist/index.html'))
      .toString()

    const headContent = ssrResult.head ? ssrResult.head.join('\n    ') : ''

    const html = htmlTemplate
      .replace('{{ headAttribute }}', 'inertia')
      .replace(/<script>\s*window\.initialPage = '{{ placeholder }}'\s*<\/script>/, headContent)
      .replace('<div id="app"></div>', ssrResult.body)

    return res.status(200).send(html)
  },
  renderSSRAuto: async (req, res, data) => {
    data = buildPageData(req, data)

    if (req.get('X-Inertia')) {
      res.header('Vary', 'Accept')
      res.header('X-Inertia', true)
      return res.status(200).json(data)
    }

    const ssrResult = await ssr.renderAuto(data)
    const htmlTemplate = fs
      .readFileSync(path.resolve(__dirname, '../../packages/', package, 'test-app/dist/index.html'))
      .toString()

    const headContent = ssrResult.head ? ssrResult.head.join('\n    ') : ''

    const html = htmlTemplate
      .replace('{{ headAttribute }}', 'inertia')
      .replace(/<script>\s*window\.initialPage = '{{ placeholder }}'\s*<\/script>/, headContent)
      .replace('<div id="app"></div>', ssrResult.body)

    return res.status(200).send(html)
  },
  renderAuto: (req, res, data) => {
    data = buildPageData(req, data)
    data = processPartialProps(req, data)

    if (req.get('X-Inertia')) {
      res.header('Vary', 'Accept')
      res.header('X-Inertia', true)
      return res.status(200).json(data)
    }

    // Escape for HTML attribute (configureInertiaApp reads from data-page attribute)
    const escapedData = JSON.stringify(data).replace(/"/g, '&quot;')

    return res.status(200).send(
      fs
        .readFileSync(path.resolve(__dirname, '../../packages/', package, 'test-app/dist/index-auto.html'))
        .toString()
        .replace('{{ headAttribute }}', data.component === 'Head/Dataset' ? 'data-inertia' : 'inertia')
        .replace('{{ placeholder }}', escapedData),
    )
  },
  location: (res, href) => res.status(409).header('X-Inertia-Location', href).send(''),
}
