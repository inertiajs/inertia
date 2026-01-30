const http = require('http')

const SSR_PORT = 13714
const SSR_AUTO_PORTS = {
  vue3: 13718,
  react: 13719,
  svelte: 13720,
}
const SSR_AUTO_PORT = SSR_AUTO_PORTS[process.env.PACKAGE || 'vue3']

function renderToPort(port, pageData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(pageData)

    const req = http.request(
      {
        hostname: 'localhost',
        port: port,
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
}

module.exports = {
  render(pageData) {
    return renderToPort(SSR_PORT, pageData)
  },
  renderAuto(pageData) {
    return renderToPort(SSR_AUTO_PORT, pageData)
  },
  SSR_PORT,
  SSR_AUTO_PORT,
}
