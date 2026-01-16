<script module lang="ts">
  export { default as layout } from '@/Layouts/WithoutScrollRegion.svelte'
</script>

<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const { foo = 'default' }: { foo?: string } = $props()

  const preserve = (e: Event) => {
    e.preventDefault()

    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'foo' },
      preserveScroll: true,
    })
  }

  const preserveFalse = (e: Event) => {
    e.preventDefault()

    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'bar' },
    })
  }

  const preserveCallback = (e: Event) => {
    e.preventDefault()

    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'baz' },
      preserveScroll: (page) => {
        console.log(JSON.stringify(page))

        return true
      },
    })
  }

  const preserveCallbackFalse = (e: Event) => {
    e.preventDefault()

    router.visit('/visits/preserve-scroll-false-page-two', {
      data: { foo: 'foo' },
      preserveScroll: (page) => {
        console.log(JSON.stringify(page))

        return false
      },
    })
  }

  const preserveGet = (e: Event) => {
    e.preventDefault()

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

  const preserveGetFalse = (e: Event) => {
    e.preventDefault()

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

  <a href={'#'} onclick={preserve} class="preserve">Preserve Scroll</a>
  <a href={'#'} onclick={preserveFalse} class="reset">Reset Scroll</a>
  <a href={'#'} onclick={preserveCallback} class="preserve-callback">Preserve Scroll (Callback)</a>
  <br />
  <a href={'#'} onclick={preserveCallbackFalse} class="reset-callback">Reset Scroll (Callback)</a>
  <a href={'#'} onclick={preserveGet} class="preserve-get">Preserve Scroll (GET)</a>
  <a href={'#'} onclick={preserveGetFalse} class="reset-get">Reset Scroll (GET)</a>

  <a href="/non-inertia" class="off-site">Off-site link</a>
</div>
