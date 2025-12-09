<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let foo = ''
  export let bar = ''

  const replaceSequentially = () => {
    router.replaceProp('foo', 'baz')
    router.replaceProp('bar', 'qux')
  }
</script>

<div>
  <p>Foo: {foo}</p>
  <p>Bar: {bar}</p>

  <button on:click={replaceSequentially}>Replace foo and bar sequentially</button>
</div>
