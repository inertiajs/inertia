#!/usr/bin/env node
import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import fs from 'node:fs'
import path from 'node:path'
import sveltePreprocess from 'svelte-preprocess'
import * as svelte from 'svelte/compiler'

const watch = process.argv.slice(1).includes('--watch')

const config = {
  bundle: true,
  minify: true,
  sourcemap: true,
  target: 'es2020',
  plugins: [nodeExternalsPlugin()],
  external: ['*.svelte'],
}

const builds = [
  {
    entryPoints: ['src/index.ts'],
    format: 'esm',
    outfile: 'dist/index.js',
    platform: 'browser',
  },
  {
    entryPoints: ['src/index.ts'],
    format: 'cjs',
    outfile: 'dist/index.cjs',
    platform: 'browser',
  },
  {
    entryPoints: ['src/server.ts'],
    format: 'esm',
    outfile: 'dist/server.js',
    platform: 'node',
  },
  {
    entryPoints: ['src/server.ts'],
    format: 'cjs',
    outfile: 'dist/server.cjs',
    platform: 'node',
  },
]

builds.forEach((build) => {
  esbuild
    .build({ ...config, ...build, ...watcher(build) })
    .then(() => console.log(`${watch ? 'Watching' : 'Built'} ${build.entryPoints} (${build.format})…`))
    .catch(() => process.exit(1))
})
// Copy components folder to dist folder
const componentsSrc = path.join(process.cwd(), 'src/components/')
const componentsDest = path.join(process.cwd(), 'dist/components/')
if (!fs.existsSync(componentsDest)) {
  fs.mkdirSync(componentsDest)
}
for (const filename of fs.readdirSync(componentsSrc)) {
  const source = fs.readFileSync(path.join(componentsSrc, filename), 'utf8')
  svelte.preprocess(source, sveltePreprocess(), { filename }).then(({ code }) => {
    fs.writeFileSync(path.join(componentsDest, filename), code)
  })
}

function watcher(build) {
  return watch
    ? {
        watch: {
          onRebuild: (error) =>
            error
              ? console.error('Watch failed:', error)
              : console.log(`Rebuilding ${build.entryPoints} (${build.format})…`),
        },
      }
    : {}
}
