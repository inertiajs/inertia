const http = require('http')

const SSR_PORT = 13714

module.exports = {
  render(pageData) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(pageData)

      const req = http.request(
        {
          hostname: 'localhost',
          port: SSR_PORT,
          path: '/render',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => {
            try {
              resolve(JSON.parse(data))
            } catch (e) {
              reject(new Error(`Failed to parse SSR response: ${data}`))
            }
          })
        },
      )

      req.on('error', (e) => reject(new Error(`SSR server error: ${e.message}`)))
      req.write(postData)
      req.end()
    })
  },
}
