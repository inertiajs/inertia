<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const complete = () => {
    router.post('/layers/prompt/complete')
  }
</script>

<div id="prompt-page">Sudo prompt</div>

<button onclick={complete}>Complete the prompt</button>
