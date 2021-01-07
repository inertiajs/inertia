module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['plugin:cypress/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
    'comma-dangle': ['warn', 'always-multiline'],
    'cypress/no-unnecessary-waiting': 'off',
  },
}
