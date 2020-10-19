const path = require('path')
const express = require('express')
const helpers = require('./helpers')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json({ extended: true }))
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

app.get('/links-target/get', (req, res) => render(req, res, { component: 'LinksTarget', props: { method: 'get', form: req.body, query: req.query }}))
app.post('/links-target/post', (req, res) => render(req, res, { component: 'LinksTarget', props: { method: 'post', form: req.body, query: req.query }}))
app.put('/links-target/put', (req, res) => render(req, res, { component: 'LinksTarget', props: { method: 'put', form: req.body, query: req.query }}))
app.patch('/links-target/patch', (req, res) => render(req, res, { component: 'LinksTarget', props: { method: 'patch', form: req.body, query: req.query }}))
app.delete('/links-target/delete', (req, res) => render(req, res, { component: 'LinksTarget', props: { method: 'delete', form: req.body, query: req.query }}))

app.get('*', (req, res) => render(req, res))

app.listen(13714)
