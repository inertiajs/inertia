<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    foo?: number[]
    bar?: number[]
  }

  let { foo = [], bar = [] }: Props = $props()

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
<button onclick={reloadIt}>Reload</button>
<button onclick={getFresh}>Get Fresh</button>
