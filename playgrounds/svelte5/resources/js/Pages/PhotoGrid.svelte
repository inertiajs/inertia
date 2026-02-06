<script module>
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { InfiniteScroll } from '@inertiajs/svelte'
  import Image from '../Components/Image.svelte'
  import Spinner from '../Components/Spinner.svelte'

  let { appName, photos } = $props()
</script>

<svelte:head>
  <title>Photo Grid - {appName}</title>
</svelte:head>

<InfiniteScroll
  data="photos"
  class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  buffer={1000}
>
  {#snippet loading()}
    <div class="flex justify-center py-16">
      <Spinner class="size-6 text-gray-400" />
    </div>
  {/snippet}

  {#each photos.data as photo (photo.id)}
    <Image id={photo.id} url={photo.url} />
  {/each}
</InfiniteScroll>
