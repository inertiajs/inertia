<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let draft = $state('')
  let banner = $state('')
  let bannerMode = $state(false)
  let lastVersionChange = $state('')

  onMount(() => {
    return router.on('location', (event) => {
      lastVersionChange = String(event.detail.versionChange)

      if (bannerMode && event.detail.versionChange) {
        event.preventDefault()
        banner = 'A new version is available'
      }
    })
  })

  const backgroundReload = () => {
    router.reload({ headers: { 'X-Simulate-Version-Change': '1' } })
  }

  const backgroundManualLocation = () => {
    router.reload({ headers: { 'X-Simulate-Manual-Location': '1' } })
  }
</script>

<div>
  <span class="text">This is the page that demonstrates async location visits</span>

  <input id="draft" bind:value={draft} />

  <button onclick={backgroundReload} class="reload">Background reload</button>
  <button onclick={backgroundManualLocation} class="manual-location">Background manual location</button>
  <button onclick={() => (bannerMode = !bannerMode)} class="banner-mode">Banner mode: {bannerMode}</button>

  <span id="version-change">{lastVersionChange}</span>
  <span id="banner">{banner}</span>
</div>
