<script lang="ts">
  import { page, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  const { foo, bar, baz, headers } = $props()

  onMount(() => {
    // Other initialization if needed
  })

  // Update props reactively when page changes
  $effect(() => {
    if (typeof window !== 'undefined') {
      window._inertia_props = page.props
    }
  })

  const partialReloadVisit = () => {
    router.visit('/visits/partial-reloads', {
      data: { foo },
    })
  }

  const partialReloadVisitFooBar = () => {
    router.visit('/visits/partial-reloads', {
      data: { foo },
      only: ['headers', 'foo', 'bar'],
    })
  }

  const partialReloadVisitBaz = () => {
    router.visit('/visits/partial-reloads', {
      data: { foo },
      only: ['headers', 'baz'],
    })
  }

  const partialReloadVisitExceptFooBar = () => {
    router.visit('/visits/partial-reloads', {
      data: { foo },
      except: ['foo', 'bar'],
    })
  }

  const partialReloadVisitExceptBaz = () => {
    router.visit('/visits/partial-reloads', {
      data: { foo },
      except: ['baz'],
    })
  }

  const partialReloadGet = () => {
    router.get('/visits/partial-reloads', {
      foo,
    })
  }

  const partialReloadGetFooBar = () => {
    router.get(
      '/visits/partial-reloads',
      {
        foo,
      },
      {
        only: ['headers', 'foo', 'bar'],
      },
    )
  }

  const partialReloadGetBaz = () => {
    router.get(
      '/visits/partial-reloads',
      {
        foo,
      },
      {
        only: ['headers', 'baz'],
      },
    )
  }

  const partialReloadGetExceptFooBar = () => {
    router.get(
      '/visits/partial-reloads',
      {
        foo,
      },
      {
        except: ['foo', 'bar'],
      },
    )
  }

  const partialReloadGetExceptBaz = () => {
    router.get(
      '/visits/partial-reloads',
      {
        foo,
      },
      {
        except: ['baz'],
      },
    )
  }
</script>

<div>
  <span class="text">This is the page that demonstrates partial reloads using manual visits</span>
  <span class="foo-text">Foo is now {foo}</span>
  <span class="bar-text">Bar is now {bar}</span>
  <span class="baz-text">Baz is now {baz}</span>
  <pre class="headers">{headers}</pre>

  <a href={'#'} onclick={partialReloadVisit} class="visit">Update All (visit)</a>
  <a href={'#'} onclick={partialReloadVisitFooBar} class="visit-foo-bar">'Only' foo + bar (visit)</a>
  <a href={'#'} onclick={partialReloadVisitBaz} class="visit-baz">'Only' baz (visit)</a>
  <a href={'#'} onclick={partialReloadVisitExceptFooBar} class="visit-except-foo-bar">'Except' foo + bar (visit)</a>
  <a href={'#'} onclick={partialReloadVisitExceptBaz} class="visit-except-baz">'Except' baz (visit)</a>

  <a href={'#'} onclick={partialReloadGet} class="get">Update All (GET)</a>
  <a href={'#'} onclick={partialReloadGetFooBar} class="get-foo-bar">'Only' foo + bar (GET)</a>
  <a href={'#'} onclick={partialReloadGetBaz} class="get-baz">'Only' baz (GET)</a>
  <a href={'#'} onclick={partialReloadGetExceptFooBar} class="get-except-foo-bar">'Except' foo + bar (GET)</a>
  <a href={'#'} onclick={partialReloadGetExceptBaz} class="get-except-baz">'Except' baz (GET)</a>
</div>
