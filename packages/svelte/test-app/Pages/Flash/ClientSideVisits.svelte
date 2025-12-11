<script context="module" lang="ts">
  declare global {
    interface Window {
      flashCount: number
    }
  }
</script>

<script lang="ts">
  import { router, page } from '@inertiajs/svelte'

  window.flashCount ??= 0

  const withFlash = () => {
    router.replace({
      flash: { foo: 'bar' },
      onFlash: () => window.flashCount++,
    })
  }

  const withFlashFunction = () => {
    router.replace({
      flash: (flash) => ({ ...flash, bar: 'baz' }),
      onFlash: () => window.flashCount++,
    })
  }

  const withoutFlash = () => {
    router.replace({
      props: (props) => ({ ...props }),
      onFlash: () => window.flashCount++,
    })
  }
</script>

<div>
  <span id="flash">{JSON.stringify($page.flash)}</span>

  <button on:click={withFlash}>With flash object</button>
  <button on:click={withFlashFunction}>With flash function</button>
  <button on:click={withoutFlash}>Without flash</button>
</div>
