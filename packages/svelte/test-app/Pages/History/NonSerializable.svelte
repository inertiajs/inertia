<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const pushFunctionProp = () => {
    router.push({
      url: '/history/non-serializable/target',
      component: 'History/NonSerializableTarget',
      props: { message: 'Target page', onAction: () => 'action from the function prop' },
    })
  }
</script>

<button onclick={pushFunctionProp}>Push a function prop</button>
