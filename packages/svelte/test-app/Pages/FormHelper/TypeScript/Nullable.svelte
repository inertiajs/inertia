<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte'

  useForm<{ object: { x: number } | null }>({
    object: null,
  })

  useForm<{ object: { x: number } | null }>({
    object: { x: 1 },
  })
</script>
