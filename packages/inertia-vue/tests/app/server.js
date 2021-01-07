const path = require('path')
const express = require('express')
const inertia = require('./helpers')
const bodyParser = require('body-parser')
const multer  = require('multer')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))
const upload = multer()

// Used because Cypress does not allow you to navigate to a different origin URL within a single test.
app.all('/non-inertia', (req, res) => res.send('This is a page that does not have the Inertia app loaded.'))

// Intercepts all .js assets (including files loaded via code splitting)
app.get(/.*\.js$/, (req, res) => res.sendFile(path.resolve(__dirname, '../tmp/', req.path.substr(1))))

/**
 * Used for testing the Inertia plugin is registered.
 * @see plugin.test.js
 */
app.get('/plugin/*', (req, res) => inertia.render(req, res, {
  component: 'Home',
  props: {
    example: 'FooBar',
  },
}))

/**
 * Our actual 'app' routes
 */
app.get('/', (req, res) => inertia.render(req, res, {
  component: 'Home',
  props: {
    example: 'FooBar',
  },
}))

app.get('/location', ({ res }) => inertia.location(res, '/non-inertia'))

app.get('/links/as-warning/:method', (req, res) => inertia.render(req, res, { component: 'Links/AsWarning', props: { method: req.params.method }}))
app.get('/links/partial-reloads', (req, res) => inertia.render(req, res, { component: 'Links/PartialReloads', props: { headers: req.headers, foo: Number.parseInt(req.query.foo || 0) + 1, bar: props => props.foo + 1, baz: props => props.foo + 2 }}))
app.all('/links/preserve-state-page-two', (req, res) => inertia.render(req, res, { component: 'Links/PreserveState', props: { foo: req.query.foo }}))

app.all('/links/preserve-scroll-page-two', (req, res) => inertia.render(req, res, { component: 'Links/PreserveScroll', props: { foo: req.query.foo }}))
app.all('/links/preserve-scroll-false-page-two', (req, res) => inertia.render(req, res, { component: 'Links/PreserveScrollFalse', props: { foo: req.query.foo }}))

app.get('/visits/partial-reloads', (req, res) => inertia.render(req, res, { component: 'Visits/PartialReloads', props: { headers: req.headers, foo: Number.parseInt(req.query.foo || 0) + 1, bar: props => props.foo + 1, baz: props => props.foo + 2 }}))
app.all('/visits/preserve-state-page-two', (req, res) => inertia.render(req, res, { component: 'Visits/PreserveState', props: { foo: req.query.foo }}))

app.all('/visits/preserve-scroll-page-two', (req, res) => inertia.render(req, res, { component: 'Visits/PreserveScroll', props: { foo: req.query.foo }}))
app.all('/visits/preserve-scroll-false-page-two', (req, res) => inertia.render(req, res, { component: 'Visits/PreserveScrollFalse', props: { foo: req.query.foo }}))

app.post('/visits/events-errors', (req, res) => inertia.render(req, res, { component: 'Visits/Events', props: { errors: { foo: 'bar' } }}))

app.get('/dump/get', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'get', form: req.body, query: req.query, files: req.files }}))
app.post('/dump/post', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'post', form: req.body, query: req.query, files: req.files }}))
app.put('/dump/put', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'put', form: req.body, query: req.query, files: req.files }}))
app.patch('/dump/patch', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'patch', form: req.body, query: req.query, files: req.files }}))
app.delete('/dump/delete', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'delete', form: req.body, query: req.query, files: req.files }}))

app.all('/sleep', (req, res) => setTimeout(() => res.send(''), 2000))
app.post('/redirect', (req, res) => res.redirect(303, '/dump/get'))
app.post('/redirect-external', (req, res) => inertia.location(res, '/non-inertia'))

app.get('*', (req, res) => inertia.render(req, res))

app.listen(13714)
