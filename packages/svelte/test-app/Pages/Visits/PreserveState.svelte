<script>
  import { router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  export let foo = 'default'

  onMount(() => {
    window._inertia_page_key = crypto.randomUUID()
  })

  const preserve = () => {
    router.visit('/visits/preserve-state-page-two', {
      data: { foo: 'bar' },
      preserveState: true,
    })
  }

  const preserveFalse = () => {
    router.visit('/visits/preserve-state-page-two', {
      data: { foo: 'baz' },
      preserveState: false,
    })
  }

  const preserveCallback = () => {
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

  const preserveCallbackFalse = () => {
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

  const preserveGet = () => {
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

  const preserveGetFalse = () => {
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

  <a href="#" on:click|preventDefault={preserve} class="preserve">[State] Preserve visit: true</a>
  <a href="#" on:click|preventDefault={preserveFalse} class="preserve-false">[State] Preserve visit: false</a>
  <a href="#" on:click|preventDefault={preserveCallback} class="preserve-callback">[State] Preserve Callback: true</a>
  <a href="#" on:click|preventDefault={preserveCallbackFalse} class="preserve-callback-false"
    >[State] Preserve Callback: false</a
  >
  <a href="#" on:click|preventDefault={preserveGet} class="preserve-get">[State] Preserve GET: true</a>
  <a href="#" on:click|preventDefault={preserveGetFalse} class="preserve-get-false">[State] Preserve GET: false</a>
</div>
