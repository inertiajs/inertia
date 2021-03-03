import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const production = !process.env.ROLLUP_WATCH

const globals = {
  svelte: 'svelte',
  'svelte/internal': 'internal',
  'svelte/store': 'store',
  '@inertiajs/inertia': 'Inertia',
}

export default {
  input: 'src/index.js',
  external: ['svelte', '@inertiajs/inertia'],
  output: [
    { file: pkg.module, format: 'es', globals, sourcemap: true },
    { file: pkg.main, format: 'umd', name: 'inertia-svelte', globals, sourcemap: true },
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
    babel(),
    production && terser(),
  ],
}
