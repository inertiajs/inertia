const path = require('path')
const fs = require('fs')

module.exports = {
    render: (req, res, data) => {
        data = {
            component: '',
            props: {},
            url: req.path,
            version: null,
            ... data
        }

        if (req.get('X-Inertia')) {
            res.header('X-Inertia', true)
            return res.json(data)
        }

        return res.send(fs
            .readFileSync(path.resolve(__dirname, 'inertia.html'))
            .toString()
            .replace("'{{ placeholder }}'", JSON.stringify(data))
        )
    }
}
