<script module>
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { InfiniteScroll } from '@inertiajs/svelte'
  import Image from '../Components/Image.svelte'
  import Spinner from '../Components/Spinner.svelte'

  let { appName, photos = { data: [] } } = $props()
</script>

<svelte:head>
  <title>Photo Grid (Horizontal) - {appName}</title>
</svelte:head>

<div class="flex h-[200px] w-screen overflow-x-scroll">
  <InfiniteScroll data="photos" buffer={1000} class="flex h-[200px] gap-6">
    <div slot="loading">
      <div class="mx-6 flex h-[200px] w-[200px] animate-pulse items-center justify-center rounded-lg bg-gray-300">
        <Spinner class="size-6 text-gray-400" />
      </div>
    </div>

    {#each photos.data as photo (photo.id)}
      <Image id={photo.id} url={photo.url} />
    {/each}
  </InfiniteScroll>
</div>
