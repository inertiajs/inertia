<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    config: {
      locale?: string
      timezone: string
    }
  }

  let { config }: Props = $props()
</script>

<p id="locale">Locale: {config.locale}</p>
<p id="timezone">Timezone: {config.timezone}</p>
<button onclick={() => router.reload()}>Reload</button>
<button onclick={() => router.reload({ only: ['config'] })}>Reload only config</button>
