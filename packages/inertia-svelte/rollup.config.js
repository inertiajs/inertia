import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import svelte from 'rollup-plugin-svelte'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const production = !process.env.ROLLUP_WATCH

const globals = {
  svelte: 'Svelte',
  'svelte/internal': 'internal',
  'svelte/store': 'store',
  '@inertiajs/inertia': 'Inertia',
}

export default {
  input: 'src/index.js',
  external: ['svelte', '@inertiajs/inertia'],
  output: [
    { file: pkg.module, format: 'es', globals },
    { file: pkg.main, format: 'umd', name: 'inertia-svelte', globals },
  ],
  plugins: [
    peerDepsExternal(),
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    production && terser(),
  ],
}
