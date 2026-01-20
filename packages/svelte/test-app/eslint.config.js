import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'

export default ts.config(
  {
    files: ['**/*.js', '**/*.ts', '**/*.svelte'],
  },
  {
    ignores: ['node_modules', 'dist/**/*', '*.config.js', '**/*.d.ts', '*.timestamp-*'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
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
    files: ['**/*.ts', '**/*.svelte'],
    // See more details at: https://typescript-eslint.io/packages/parser/
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
        parser: ts.parser,
        // Specify a parser for each language, if needed:
        // parser: {
        //   ts: ts.parser,
        //   js: espree,    // Use espree for .js files (add: import espree from 'espree')
        //   typescript: ts.parser
        // },

        // We recommend importing and specifying svelte.config.js.
        // By doing so, some rules in eslint-plugin-svelte will automatically read the configuration and adjust their behavior accordingly.
        // While certain Svelte settings may be statically loaded from svelte.config.js even if you don’t specify it,
        // explicitly specifying it ensures better compatibility and functionality.
        //
        // If non-serializable properties are included, running ESLint with the --cache flag will fail.
        // In that case, please remove the non-serializable properties. (e.g. `svelteConfig: { ...svelteConfig, kit: { ...svelteConfig.kit, typescript: undefined }}`)
        svelteConfig,
      },
    },
  },
  {
    rules: {
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/no-useless-mustaches': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.svelte'],
    rules: {
      '@typescript-eslint/unbound-method': 'error',
    },
  },
)
