const fs = require('fs')
const path = require('path')
const svelte = require('svelte/compiler');

function compile(name) {
  const inertia = fs.readFileSync(path.resolve(__dirname, `../src/${name}.svelte`)).toString('utf-8')
  const result = svelte.compile(inertia, { generate: 'ssr' });
  fs.writeFileSync(path.resolve(__dirname, `../src/ssr/${name}.js`), result.js.code)
}

compile('App')
compile('InertiaLink')
compile('Render')

fs.copyFileSync(
  path.resolve(__dirname, `../src/createInertiaApp.js`),
  path.resolve(__dirname, `../src/ssr/createInertiaApp.js`)
)
