<script context="module">
  export { default as layout } from '@/Layouts/WithoutScrollRegion.svelte'
</script>

<script>
  import { router } from '@inertiajs/svelte'

  export let foo = 'default'

  const preserve = () => {
    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'foo' },
      preserveScroll: true,
    })
  }

  const preserveFalse = () => {
    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'bar' },
    })
  }

  const preserveCallback = () => {
    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'baz' },
      preserveScroll: (page) => {
        console.log(JSON.stringify(page))

        return true
      },
    })
  }

  const preserveCallbackFalse = () => {
    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'foo' },
      preserveScroll: (page) => {
        console.log(JSON.stringify(page))

        return false
      },
    })
  }

  const preserveGet = () => {
    router.get(
      '/visits/preserve-scroll-false-page-two',
      {
        foo: 'bar',
      },
      {
        preserveScroll: true,
      },
    )
  }

  const preserveGetFalse = () => {
    router.get('/visits/preserve-scroll-false-page-two', {
      foo: 'baz',
    })
  }
</script>

<div style="height: 800px; width: 600px">
  <span class="text">
    This is the page that demonstrates scroll preservation without scroll regions when using manual visits
  </span>
  <span class="foo">Foo is now {foo}</span>

  <a href="#" on:click|preventDefault={preserve} class="preserve">Preserve Scroll</a>
  <a href="#" on:click|preventDefault={preserveFalse} class="reset">Reset Scroll</a>
  <a href="#" on:click|preventDefault={preserveCallback} class="preserve-callback">Preserve Scroll (Callback)</a>
  <br />
  <a href="#" on:click|preventDefault={preserveCallbackFalse} class="reset-callback">Reset Scroll (Callback)</a>
  <a href="#" on:click|preventDefault={preserveGet} class="preserve-get">Preserve Scroll (GET)</a>
  <a href="#" on:click|preventDefault={preserveGetFalse} class="reset-get">Reset Scroll (GET)</a>

  <a href="/non-inertia" class="off-site">Off-site link</a>
</div>
