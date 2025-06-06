<script>
  import { page, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  export let foo = 0
  export let bar
  export let baz
  export let headers

  onMount(() => {
    window._inertia_props = $page.props
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

  <a href="#" on:click={partialReloadVisit} class="visit">Update All (visit)</a>
  <a href="#" on:click={partialReloadVisitFooBar} class="visit-foo-bar">'Only' foo + bar (visit)</a>
  <a href="#" on:click={partialReloadVisitBaz} class="visit-baz">'Only' baz (visit)</a>
  <a href="#" on:click={partialReloadVisitExceptFooBar} class="visit-except-foo-bar">'Except' foo + bar (visit)</a>
  <a href="#" on:click={partialReloadVisitExceptBaz} class="visit-except-baz">'Except' baz (visit)</a>

  <a href="#" on:click={partialReloadGet} class="get">Update All (GET)</a>
  <a href="#" on:click={partialReloadGetFooBar} class="get-foo-bar">'Only' foo + bar (GET)</a>
  <a href="#" on:click={partialReloadGetBaz} class="get-baz">'Only' baz (GET)</a>
  <a href="#" on:click={partialReloadGetExceptFooBar} class="get-except-foo-bar">'Except' foo + bar (GET)</a>
  <a href="#" on:click={partialReloadGetExceptBaz} class="get-except-baz">'Except' baz (GET)</a>
</div>
