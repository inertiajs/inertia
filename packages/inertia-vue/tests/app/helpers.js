const path = require('path')
const fs = require('fs')

module.exports = {
  render: (req, res, data) => {
    data = {
      component: req.path.slice(1)
        .split('/').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('/')
        .split('-').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join(''),
      props: {},
      url: req.path,
      version: null,
      ... data,
    }

    if (req.get('X-Inertia')) {
      res.header('X-Inertia', true)
      return res.json(data)
    }

    return res.send(fs
      .readFileSync(path.resolve(__dirname, 'inertia.html'))
      .toString()
      .replace('\'{{ placeholder }}\'', JSON.stringify(data)),
    )
  },
}
