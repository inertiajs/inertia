<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { InertiaFormRunes } from '@inertiajs/svelte5'

  const { form }: { form: InertiaFormRunes<{
    name: string;
    email?: string;
  }> } = $props()
</script>

<p>Name: {form.name}</p>
<p>Email: {form.email}</p>
