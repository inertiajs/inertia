const path = require('path')
const fs = require('fs')
const lodash = require('lodash-es')

const package = process.env.PACKAGE || 'vue3'

module.exports = {
  package,
  render: (req, res, data) => {
    data = {
      component: req.path
        .slice(1)
        .split('/')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('/')
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(''),
      props: {},
      // TODO: url should be req.originalUrl as that includes the query string
      url: req.path,
      version: null,
      ...data,
    }

    if (data.component.startsWith('InfiniteScroll')) {
      // Support absolute URL format for testing URL preservation
      if (req.query.absolutePageUrl) {
        const protocol = req.protocol
        const host = req.get('host')
        data.url = `${protocol}://${host}${req.originalUrl}`
      } else {
        data.url = req.originalUrl
      }
    }

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

    if (req.get('X-Inertia')) {
      res.header('Vary', 'Accept')
      res.header('X-Inertia', true)
      return res.json(data)
    }

    return res.send(
      fs
        .readFileSync(path.resolve(__dirname, '../../packages/', package, 'test-app/dist/index.html'))
        .toString()
        .replace("'{{ placeholder }}'", JSON.stringify(data))
        .replace('{{ dataPage }}', lodash.escape(JSON.stringify(data))),
    )
  },
  location: (res, href) => res.status(409).header('X-Inertia-Location', href).send(''),
}
