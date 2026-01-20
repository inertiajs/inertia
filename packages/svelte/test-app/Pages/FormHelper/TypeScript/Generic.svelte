<script lang="ts" generics="TFormData extends Record<string, FormDataConvertible>">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { FormDataConvertible } from '@inertiajs/core'
  import type { InertiaForm } from '@inertiajs/svelte'

  interface Props {
    form: InertiaForm<TFormData>
  }

  let { form }: Props = $props()
</script>

<div>{form}</div>
