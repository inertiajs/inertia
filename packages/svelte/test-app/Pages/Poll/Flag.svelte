<script lang="ts">
  import { router, usePoll } from '@inertiajs/svelte'

  let pollFlag = $state('pending')
  let reloadFlag = $state('pending')

  usePoll(500, {
    onFinish(visit) {
      pollFlag = String((visit as any).poll === true)
    },
  })

  const reload = () => {
    router.reload({
      onFinish(visit) {
        reloadFlag = String((visit as any).poll === true)
      },
    })
  }
</script>

<div id="poll-flag">poll: {pollFlag}</div>
<div id="reload-flag">reload: {reloadFlag}</div>
<button onclick={reload}>Reload</button>
