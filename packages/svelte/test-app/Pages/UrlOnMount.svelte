<script lang="ts">
  let settled = $state(false)
  let historyDelta: number | null = $state(null)
  let search = $state('')

  if (typeof window !== 'undefined') {
    // Simulate an app (or third-party library) that adds a query param via the
    // History API while the page is mounting, before Inertia's queued initial
    // history write has flushed.
    const historyLengthAtMount = window.history.length
    window.history.replaceState(window.history.state, '', '/url-on-mount?step=1')

    document.addEventListener(
      'inertia:navigate',
      () => {
        historyDelta = window.history.length - historyLengthAtMount
        search = window.location.search
        settled = true
      },
      { once: true },
    )
  }
</script>

<div>
  <h1>Url On Mount</h1>
  {#if settled}
    <div id="settled">
      <span class="search">{search}</span>
      <span class="history-delta">{historyDelta}</span>
    </div>
  {/if}
</div>
