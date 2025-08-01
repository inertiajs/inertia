<script lang="ts" generics="TFormData extends Record<string, FormDataConvertible>">
  import type { FormDataConvertible } from '@inertiajs/core'
  import type { InertiaForm } from '@inertiajs/svelte'

  export let form: InertiaForm<TFormData>
</script>

<div>{form}</div>