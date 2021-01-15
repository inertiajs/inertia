import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.module, 'format': 'es' },
      { file: pkg.main, 'format': 'umd', name: 'inertia-svelte' }
    ],
    plugins: [
      json(),
      commonjs(),
      resolve({ browser: true }),
      svelte()
    ]
  },
]
