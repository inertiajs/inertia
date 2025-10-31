import prettier from 'eslint-config-prettier/flat'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
  },
  {
    ignores: ['node_modules', 'dist/**/*', '*.config.js', '**/*.d.ts'],
  },
  vue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier,
)
