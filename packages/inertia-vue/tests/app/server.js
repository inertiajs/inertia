const path = require('path')
const express = require('express')
const inertia = require('./helpers')
const bodyParser = require('body-parser')
const multer  = require('multer')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))
const upload = multer()

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

app.get('/location', ({ res }) => inertia.location(res, 'https://google.com'))
app.all('/links/preserve-state-page-two', (req, res) => inertia.render(req, res, { component: 'Links/PreserveState', props: { foo: req.query.foo }}))

app.get('/dump/get', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'get', form: req.body, query: req.query, files: req.files }}))
app.post('/dump/post', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'post', form: req.body, query: req.query, files: req.files }}))
app.put('/dump/put', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'put', form: req.body, query: req.query, files: req.files }}))
app.patch('/dump/patch', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'patch', form: req.body, query: req.query, files: req.files }}))
app.delete('/dump/delete', upload.any(), (req, res) => inertia.render(req, res, { component: 'Dump', props: { headers: req.headers, method: 'delete', form: req.body, query: req.query, files: req.files }}))

app.get('*', (req, res) => inertia.render(req, res))

app.listen(13714)
