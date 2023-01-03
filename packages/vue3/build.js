#!/usr/bin/env node
const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

let config = {
  bundle: true,
  minify: true,
  sourcemap: true,
  target: 'es2020',
  plugins: [nodeExternalsPlugin()],
}

if (process.argv.slice(1).includes('--watch')) {
  config.watch = {
    onRebuild(error) {
      if (error) console.error('watch build failed:', error)
      else console.log('watch build succeeded')
    },
  }
}

esbuild
  .build({
    ...config,
    entryPoints: ['src/index.ts'],
    format: 'esm',
    outfile: 'dist/index.esm.js',
    platform: 'browser',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...config,
    entryPoints: ['src/index.ts'],
    format: 'cjs',
    outfile: 'dist/index.js',
    platform: 'browser',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...config,
    entryPoints: ['src/server.ts'],
    format: 'esm',
    outfile: 'dist/server.esm.js',
    platform: 'node',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...config,
    entryPoints: ['src/server.ts'],
    format: 'cjs',
    outfile: 'dist/server.js',
    platform: 'node',
  })
  .catch(() => process.exit(1))
