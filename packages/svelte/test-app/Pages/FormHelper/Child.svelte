<script lang="ts">
  import type { InertiaForm } from '@inertiajs/svelte'
  
  export let form: InertiaForm<{
    name: string
    email?: string
  }>
</script>

<p>Name: {form.name}</p>
<p>Email: {form.email}</p>