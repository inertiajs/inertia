const path = require('path')
const express = require('express')
const helpers = require('./helpers')

const app = express()
const render = helpers.render

// Intercepts all .js assets (including files loaded via code splitting)
app.get(/.*\.js$/, (req, res) => res.sendFile(path.resolve(__dirname, '../tmp/', req.path.substr(1))))

// Our actual 'app routes'
app.get('/', (req, res) => render(req, res, {
    component: 'Home',
    props: {
        example: 'FooBar',
    }
}))

app.get('/links', (req, res) => render(req, res, {
    component: 'Links'
}))

app.get('/links-target-1', (req, res) => render(req, res, {
    component: 'LinksTarget'
}))

app.listen(13714)
