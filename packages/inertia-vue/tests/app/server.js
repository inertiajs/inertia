const path = require('path')
const express = require('express')
const helpers = require('./helpers')
const bodyParser = require('body-parser')
const multer  = require('multer')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))
const render = helpers.render
const upload = multer()

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

app.get('/links-target/get', upload.any(), (req, res) => render(req, res, { component: 'LinksTarget', props: { contentType: req.headers['content-type'] || '', method: 'get', form: req.body, query: req.query, files: req.files }}))
app.post('/links-target/post', upload.any(), (req, res) => render(req, res, { component: 'LinksTarget', props: { contentType: req.headers['content-type'] || '', method: 'post', form: req.body, query: req.query, files: req.files }}))
app.put('/links-target/put', upload.any(), (req, res) => render(req, res, { component: 'LinksTarget', props: { contentType: req.headers['content-type'] || '', method: 'put', form: req.body, query: req.query, files: req.files }}))
app.patch('/links-target/patch', upload.any(), (req, res) => render(req, res, { component: 'LinksTarget', props: { contentType: req.headers['content-type'] || '', method: 'patch', form: req.body, query: req.query, files: req.files }}))
app.delete('/links-target/delete', upload.any(), (req, res) => render(req, res, { component: 'LinksTarget', props: { contentType: req.headers['content-type'] || '', method: 'delete', form: req.body, query: req.query, files: req.files }}))

app.get('*', (req, res) => render(req, res))

app.listen(13714)
