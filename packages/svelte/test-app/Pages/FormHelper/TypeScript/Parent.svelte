<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte'
  import Child from './Child.svelte'

  const form = useForm({
    name: 'foo',
    remember: false,
  })
</script>

<Child {form} />
