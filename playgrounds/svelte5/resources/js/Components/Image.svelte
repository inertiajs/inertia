<script>
  import { onMount } from 'svelte'

  let { id, url } = $props()

  let loaded = $state(false)
  let imageElement

  onMount(() => {
    if (imageElement?.complete) {
      loaded = true
    }
  })

  function handleLoad() {
    loaded = true
  }
</script>

<div class="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
  {#if !loaded}
    <div class="absolute inset-0 animate-pulse bg-gray-300" aria-hidden="true" />
  {/if}

  <img
    bind:this={imageElement}
    src={url}
    loading="lazy"
    decoding="async"
    class={`h-full w-full object-cover transition duration-500 ease-out ${
      loaded ? 'blur-0 scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
    }`}
    onload={handleLoad}
    alt=""
  />

  <span class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
    {id}
  </span>
</div>
