<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    foo: string | undefined
    bar: string | undefined
  }

  let { foo, bar }: Props = $props()

  function reloadBothProps() {
    router.reload({ only: ['foo'] })
    setTimeout(() => router.reload({ only: ['bar'] }), 50)
  }
</script>

<div>
  <div id="foo">Foo: {foo}</div>
  <div id="bar">Bar: {bar}</div>

  <button onclick={reloadBothProps}>Reload both props</button>
</div>
