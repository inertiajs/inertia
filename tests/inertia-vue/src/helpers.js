const path = require('path')
const fs = require('fs')

module.exports = {
    render: (req, res, data) => {
        if (req.get('X-Inertia')) {
            return res.json(data)
        }

        return res.send(fs
            .readFileSync(path.resolve(__dirname, 'inertia.html'))
            .toString()
            .replace("'{{ placeholder }}'", JSON.stringify(data))
        )
    }
}
