#!/usr/bin/env node
import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

const watch = process.argv.slice(1).includes('--watch')
const withDeps = process.argv.slice(1).includes('--with-deps')

const config = {
  bundle: true,
  minify: false,
  sourcemap: true,
  target: 'es2020',
  plugins: [
    ...(withDeps ? [] : [nodeExternalsPlugin()]),
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
].filter((build) => {
  // For ES2020 checks, we only need browser/esm build
  return !withDeps || (build.platform === 'browser' && build.format === 'esm')
})

builds.forEach(async (build) => {
  const context = await esbuild.context({
    ...config,
    ...build,
    ...(withDeps ? { outfile: build.outfile.replace(/dist\/([^.]+)/, 'dist/with-deps.$1') } : {}),
  })

  if (watch) {
    console.log(`Watching ${build.entryPoints} (${build.format})…`)
    await context.watch()
  } else {
    await context.rebuild()
    context.dispose()
    console.log(`Built ${build.entryPoints} (${build.format}) ${withDeps ? '(with-deps)' : ''}…`)
  }
})
