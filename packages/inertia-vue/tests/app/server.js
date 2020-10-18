const path = require('path')
const express = require('express')
const helpers = require('./helpers')

const app = express()
const render = helpers.render

// Intercepts all .js assets (including files loaded via code splitting)
app.get(/.*\.js$/, (req, res) => res.sendFile(path.resolve(__dirname, '../tmp/', req.path.substr(1))))

/**
 * Used for testing the Inertia plugin is registered.
 * @see plugin.test.js
 */
app.get('/plugin/*', (req, res) => render(req, res, {
  component: 'Home',
  props: {
    example: 'FooBar',
  },
}))

/**
 * Our actual 'app' routes
 */
app.get('/', (req, res) => render(req, res, {
  component: 'Home',
  props: {
    example: 'FooBar',
  },
}))

app.get('/links', (req, res) => render(req, res))
app.get('/links-target', (req, res) => render(req, res))

app.get('/persistent-layouts/*/simple/page-*', (req, res) => render(req, res))
app.get('/persistent-layouts/*/nested/page-*', (req, res) => render(req, res))

app.listen(13714)
