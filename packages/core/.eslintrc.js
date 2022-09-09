module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    indent: ['error', 2],
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
    'comma-dangle': ['warn', 'always-multiline'],
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
  },
}
