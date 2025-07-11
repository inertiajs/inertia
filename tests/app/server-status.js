const fs = require('fs')
const os = require('os')
const path = require('path')

function showServerStatus(packageName, port) {
  const url = `http://localhost:${port}/`
  const flagFile = path.join(os.tmpdir(), `inertia-${packageName}-${port}.flag`)
  const isFirstRun = !fs.existsSync(flagFile)

  // Clean up flag file on Ctrl+C (but not on regular exit to allow nodemon restarts)
  process.on('SIGINT', () => {
    try {
      if (fs.existsSync(flagFile)) {
        fs.unlinkSync(flagFile)
      }
    } catch (err) {
      // Ignore cleanup errors
    }
    process.exit(0)
  })

  if (isFirstRun) {
    fs.writeFileSync(flagFile, '')

    console.log('\n' + '═'.repeat(80))
    console.log('║' + ' '.repeat(78) + '║')
    console.log('║' + ' 🚀 INERTIA.JS TEST SERVER '.padEnd(78) + '║')
    console.log('║' + ' '.repeat(78) + '║')
    console.log('║' + ` 📦 Package: ${packageName}`.padEnd(78) + '║')
    console.log('║' + ` 🔗 URL: ${url}`.padEnd(78) + '║')
    console.log('║' + ' '.repeat(78) + '║')
    console.log('═'.repeat(80) + '\n')
  } else {
    console.log(`🔄 Server restarted - ${packageName} test app still running on ${url}`)
  }
}

module.exports = { showServerStatus }