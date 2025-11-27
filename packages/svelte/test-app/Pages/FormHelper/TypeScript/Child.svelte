<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { InertiaForm } from '@inertiajs/svelte'

  interface Props {
    form: InertiaForm<{
      name: string
      email?: string
    }>
  }

  let { form }: Props = $props()
</script>

<p>Name: {form.name}</p>
<p>Email: {form.email}</p>
