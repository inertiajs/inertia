<script lang="ts">
  import { Link, useHttp } from '@inertiajs/svelte'

  const form = useHttp('useHttpRemember', {
    name: 'initial',
    email: '',
  })
</script>

<div>
  <h1>useHttp Remember Test</h1>

  <label>
    Name
    <input type="text" id="name" bind:value={form.name} />
  </label>

  <label>
    Email
    <input type="text" id="email" bind:value={form.email} />
  </label>

  <div id="current-values">Name: {form.name}, Email: {form.email}</div>
  <div id="is-dirty">isDirty: {form.isDirty}</div>

  <Link href="/dump/get" id="navigate-away">Navigate away</Link>
</div>
