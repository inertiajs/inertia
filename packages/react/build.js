#!/usr/bin/env node
import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { readFileSync } from 'fs'

const watch = process.argv.slice(1).includes('--watch')
const canary = process.argv.slice(1).includes('--canary')

// For regular builds, externalize all dependencies to keep the bundle size small.
// For canary builds, only externalize peer dependencies and bundle everything
// else so we can check ES2020 compatibility without checking framework code.
let externalDependencies = undefined

if (canary) {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
  externalDependencies = Object.keys(pkg.peerDependencies || {})
}

const config = {
  bundle: true,
  minify: false,
  sourcemap: true,
  target: 'es2020',
  external: externalDependencies,
  plugins: [
    ...(canary ? [] : [nodeExternalsPlugin()]),
    {
      name: 'inertia',
      setup(build) {
        let count = 0
        build.onEnd((result) => {
          if (count++ !== 0) {
            console.log(`Rebuilding ${build.initialOptions.entryPoints} (${build.initialOptions.format})…`)
          }
        })
      },
    },
  ],
}

const builds = [
  { entryPoints: ['src/index.ts'], format: 'esm', outfile: 'dist/index.esm.js', platform: 'browser' },
  { entryPoints: ['src/index.ts'], format: 'cjs', outfile: 'dist/index.js', platform: 'browser' },
  { entryPoints: ['src/server.ts'], format: 'esm', outfile: 'dist/server.esm.js', platform: 'node' },
  { entryPoints: ['src/server.ts'], format: 'cjs', outfile: 'dist/server.js', platform: 'node' },
].filter((build) => !canary || (build.platform === 'browser' && build.format === 'esm'))

builds.forEach(async (build) => {
  const context = await esbuild.context({
    ...config,
    ...build,
    ...(canary ? { outfile: build.outfile.replace(/dist\/([^.]+)/, 'dist/canary.$1') } : {}),
  })

  if (watch) {
    console.log(`Watching ${build.entryPoints} (${build.format})…`)
    await context.watch()
  } else {
    await context.rebuild()
    context.dispose()
    console.log(`Built ${build.entryPoints} (${build.format}) ${canary ? '(canary)' : ''}…`)
  }
})
