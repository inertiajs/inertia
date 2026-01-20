<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  const { foo = 'default' } = $props()

  onMount(() => {
    window._inertia_page_key = crypto.randomUUID()
  })

  const preserve = (e: Event) => {
    e.preventDefault()

    router.visit('/visits/preserve-state-page-two', {
      data: { foo: 'bar' },
      preserveState: true,
    })
  }

  const preserveFalse = (e: Event) => {
    e.preventDefault()

    router.visit('/visits/preserve-state-page-two', {
      data: { foo: 'baz' },
      preserveState: false,
    })
  }

  const preserveCallback = (e: Event) => {
    e.preventDefault()

    router.get(
      '/visits/preserve-state-page-two',
      {
        foo: 'callback-bar',
      },
      {
        preserveState: (page) => {
          alert(page)

          return true
        },
      },
    )
  }

  const preserveCallbackFalse = (e: Event) => {
    e.preventDefault()

    router.get(
      '/visits/preserve-state-page-two',
      {
        foo: 'callback-baz',
      },
      {
        preserveState: (page) => {
          alert(page)

          return false
        },
      },
    )
  }

  const preserveGet = (e: Event) => {
    e.preventDefault()

    router.get(
      '/visits/preserve-state-page-two',
      {
        foo: 'get-bar',
      },
      {
        preserveState: true,
      },
    )
  }

  const preserveGetFalse = (e: Event) => {
    e.preventDefault()

    router.get(
      '/visits/preserve-state-page-two',
      {
        foo: 'get-baz',
      },
      {
        preserveState: false,
      },
    )
  }
</script>

<div>
  <span class="text">This is the page that demonstrates preserve state on manual visits</span>
  <span class="foo">Foo is now {foo}</span>
  <label>
    Example Field
    <input type="text" name="example-field" class="field" />
  </label>

  <a href={'#'} onclick={preserve} class="preserve">[State] Preserve visit: true</a>
  <a href={'#'} onclick={preserveFalse} class="preserve-false">[State] Preserve visit: false</a>
  <a href={'#'} onclick={preserveCallback} class="preserve-callback">[State] Preserve Callback: true</a>
  <a href={'#'} onclick={preserveCallbackFalse} class="preserve-callback-false">[State] Preserve Callback: false</a>
  <a href={'#'} onclick={preserveGet} class="preserve-get">[State] Preserve GET: true</a>
  <a href={'#'} onclick={preserveGetFalse} class="preserve-get-false">[State] Preserve GET: false</a>
</div>
