<script lang="ts" generics="T extends Record<string, any>">
  import { useForm } from '@inertiajs/svelte'

  export let data: T

  const form = useForm(data)
</script>

<form>
  <slot form={$form} />
</form>
