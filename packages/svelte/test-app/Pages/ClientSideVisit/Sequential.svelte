<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    foo?: string
    bar?: string
  }

  let { foo = '', bar = '' }: Props = $props()

  const replaceSequentially = () => {
    router.replaceProp('foo', 'baz')
    router.replaceProp('bar', 'qux')
  }
</script>

<div>
  <p>Foo: {foo}</p>
  <p>Bar: {bar}</p>

  <button onclick={replaceSequentially}>Replace foo and bar sequentially</button>
</div>
