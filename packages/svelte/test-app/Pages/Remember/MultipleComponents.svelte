<script>
  import ComponentA from '@/Pages/Remember/Components/ComponentA.svelte'
  import ComponentB from '@/Pages/Remember/Components/ComponentB.svelte'
  import { inertia, useRemember } from '@inertiajs/svelte'

  let untracked = ''

  const form = useRemember({
    name: '',
    remember: false,
  })
</script>

<div>
  <label>
    Full Name
    <input type="text" id="name" name="full_name" bind:value={$form.name} />
  </label>
  <label>
    Remember Me
    <input type="checkbox" id="remember" name="remember" bind:checked={$form.remember} />
  </label>
  <label>
    Untracked
    <input type="text" id="untracked" name="untracked" bind:value={untracked} />
  </label>

  <ComponentA class="component-a" />
  <ComponentB class="component-b" />

  <a href="/dump/get" use:inertia class="link">Navigate away</a>
  <a href="/non-inertia" class="off-site">Navigate off-site</a>
</div>
