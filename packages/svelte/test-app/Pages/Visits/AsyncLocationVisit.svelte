<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let draft = $state('')

  const backgroundReload = () => {
    router.reload({
      data: { foo: 'bar' },
      headers: { 'X-Simulate-Version-Change': '1' },
    })
  }
</script>

<div>
  <span class="text">This is the page that demonstrates async location visits</span>

  <input id="draft" bind:value={draft} />

  <button onclick={backgroundReload} class="reload">Background reload</button>
</div>
