module.exports = {
  extends: ['../../.eslintrc.js', 'plugin:react/recommended'],
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}