<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let foo = '-'
  let bar = 0

  function remember() {
    router.remember('foo')
    router.remember(42, 'bar')
  }

  function restore() {
    foo = router.restore() ?? '-'
    bar = router.restore('bar') ?? 0
  }

  function restoreTyped() {
    const fooValue = router.restore<string>()
    const barValue = router.restore<number>('bar')

    fooValue?.startsWith('f')
    barValue?.toFixed(2)

    foo = fooValue ?? '-'
    bar = barValue ?? 0

    // @ts-expect-error - Testing type safety
    fooValue?.toFixed(2)
    // @ts-expect-error - Testing type safety
    barValue?.startsWith('b')
  }
</script>

<div>
  <p>Foo: {foo}</p>
  <p>Bar: {bar}</p>
  <button on:click={remember}>Remember</button>
  <button on:click={restore}>Restore</button>
  <button on:click={restoreTyped}>Restore Typed</button>
</div>
