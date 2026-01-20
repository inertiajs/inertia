<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { InfiniteScroll } from '@inertiajs/svelte'
  import Image from '../Components/Image.svelte'
  import Spinner from '../Components/Spinner.svelte'

  export let appName
  export let photos
</script>

<svelte:head>
  <title>Photo Grid (Horizontal) - {appName}</title>
</svelte:head>

<div class="flex h-[200px] w-full overflow-x-scroll">
  <InfiniteScroll data="photos" buffer={1000} class="flex h-[200px] gap-6" preserveUrl onlyNext>
    <div slot="loading">
      <div class="flex size-[200px] items-center justify-center">
        <Spinner class="size-6 text-gray-400" />
      </div>
    </div>

    {#each photos.data as photo (photo.id)}
      <Image id={photo.id} url={photo.url} />
    {/each}
  </InfiniteScroll>
</div>
