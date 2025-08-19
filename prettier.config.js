export default {
  printWidth: 120,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
  ],
}
