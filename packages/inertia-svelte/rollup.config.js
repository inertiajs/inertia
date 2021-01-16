import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import svelte from 'rollup-plugin-svelte';
import pkg from './package.json';

const production = process.env.NODE_ENV !== 'development'

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.module, 'format': 'es' },
      { file: pkg.main, 'format': 'umd', name: 'inertia-svelte' }
    ],
    plugins: [
      json(),
      peerDepsExternal(),
      svelte({
        compilerOptions: {
          dev: !production
        }
      }),
      resolve({
        browser: true,
        dedupe: ['svelte/*']
      }),
      commonjs(),
    ]
  },
]
