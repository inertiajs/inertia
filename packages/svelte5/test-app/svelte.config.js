import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const config = {
  onwarn(warning, onwarn) {
    if (/A11y/.test(warning.message)) return

    onwarn(warning)
  },

  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),
}

export default config
