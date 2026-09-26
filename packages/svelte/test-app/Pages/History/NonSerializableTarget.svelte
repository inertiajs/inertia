<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    message: string
    onAction?: () => string
  }

  let { message }: Props = $props()

  const clientVisit = () => {
    router.push({
      url: '/history/non-serializable/landed',
      component: 'History/NonSerializableTarget',
      props: { message: 'Client visit landed' },
    })
  }
</script>

<button onclick={clientVisit}>Client visit</button>

<div>{message}</div>
