<script lang="ts" generics="TFormData extends Record<string, FormDataConvertible>">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { FormDataConvertible } from '@inertiajs/core'
  import type { InertiaFormRunes } from '@inertiajs/svelte5'

  const { form }: { form: InertiaFormRunes<TFormData> } = $props()
</script>

<div>{form}</div>
