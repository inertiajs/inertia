<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  let documentScrollTop = 0
  let documentScrollLeft = 0

  const handleScrollEvent = () => {
    documentScrollTop = document.documentElement.scrollTop
    documentScrollLeft = document.documentElement.scrollLeft
  }
</script>

<svelte:document on:scroll={handleScrollEvent} />

<div>
  <span class="text">This is the links page that demonstrates url fragment behaviour</span>
  <div style="width: 200vw; height: 200vh; margin-top: 50vh">
    <!-- prettier-ignore -->
    <button on:click={handleScrollEvent}>Update scroll positions</button>
    <div class="document-position">Document scroll position is {documentScrollLeft} & {documentScrollTop}</div>
    <a href="/links/url-fragments#target" use:inertia class="basic">Basic link</a>
    <a href="#target" use:inertia class="fragment">Fragment link</a>
    <a href="/links/url-fragments#non-existent-fragment" use:inertia class="non-existent-fragment"
      >Non-existent fragment link</a
    >

    <div id="target">This is the element with id 'target'</div>
  </div>
</div>
