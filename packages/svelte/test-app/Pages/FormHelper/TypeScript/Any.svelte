<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte'

  const form = useForm<{ name: any }>({ name: null }) // eslint-disable-line @typescript-eslint/no-explicit-any

  $form.name = 0
  $form.name = 'test'
  $form.name = true
  $form.name = null
  $form.name = {
    key: 'value',
  }
</script>
