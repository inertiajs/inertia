<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import Child from './Child.svelte'

  const form = useForm({
    name: 'foo',
    remember: false,
  })
</script>

<Child form={$form} />