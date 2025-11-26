<script lang="ts">
  import { useRemember } from '@inertiajs/svelte'

  let { ...rest } = $props()

  let untracked = $state('')

  const data = useRemember(
    {
      name: '',
      remember: false,
    },
    'Example/ComponentA',
  )
</script>

<div {...rest}>
  <span>This component uses a string 'key' for the remember functionality.</span>
  <label>
    Full Name
    <input type="text" class="a-name" name="full_name" bind:value={data.name} />
  </label>
  <label>
    Remember Me
    <input type="checkbox" class="a-remember" name="remember" bind:checked={data.remember} />
  </label>
  <label>
    Remember Me
    <input type="text" class="a-untracked" name="untracked" bind:value={untracked} />
  </label>
</div>
