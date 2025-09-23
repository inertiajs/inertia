<script lang="ts" generics="TFormData extends Record<string, FormDataConvertible>">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { FormDataConvertible } from '@inertiajs/core'
  import type { InertiaForm } from '@inertiajs/svelte5'

  export let form: InertiaForm<TFormData>
</script>

<div>{form}</div>
