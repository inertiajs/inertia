<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { InertiaForm } from '@inertiajs/svelte5'

  export let form: InertiaForm<{
    name: string
    email?: string
  }>
</script>

<p>Name: {form.name}</p>
<p>Email: {form.email}</p>
