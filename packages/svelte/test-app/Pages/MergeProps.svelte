<script>
  import { router } from '@inertiajs/svelte'

  export let foo = []
  export let bar = []

  const reloadIt = () => {
    router.reload({
      only: ['foo'],
    })
  }

  const getFresh = () => {
    router.reload({
      reset: ['foo'],
    })
  }
</script>

<div>bar count is {bar.length}</div>
<div>foo count is {foo.length}</div>
<button on:click={reloadIt}>Reload</button>
<button on:click={getFresh}>Get Fresh</button>
