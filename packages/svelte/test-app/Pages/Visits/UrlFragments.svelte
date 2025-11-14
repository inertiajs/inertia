<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let documentScrollTop = 0
  let documentScrollLeft = 0

  const handleScrollEvent = () => {
    documentScrollTop = document.documentElement.scrollTop
    documentScrollLeft = document.documentElement.scrollLeft
    console.log(documentScrollTop, documentScrollLeft)
  }

  const basicVisit = () => {
    router.visit('/visits/url-fragments#target')
  }

  const fragmentVisit = () => {
    router.visit('#target')
  }

  const nonExistentFragmentVisit = () => {
    router.visit('/visits/url-fragments#non-existent-fragment')
  }

  const basicGetVisit = () => {
    router.get('/visits/url-fragments#target')
  }

  const fragmentGetVisit = () => {
    router.get('#target')
  }

  const nonExistentFragmentGetVisit = () => {
    router.get('/visits/url-fragments#non-existent-fragment')
  }
</script>

<svelte:document on:scroll={handleScrollEvent} />

<div>
  <span class="text">This is the page that demonstrates url fragment behaviour using manual visits</span>
  <div style="width: 200vw; height: 200vh; margin-top: 50vh">
    <!-- prettier-ignore -->
    <button on:click={handleScrollEvent}>Update scroll positions</button>
    <div class="document-position">Document scroll position is {documentScrollLeft} & {documentScrollTop}</div>
    <a href={'#'} on:click={basicVisit} class="basic">Basic visit</a>
    <a href={'#'} on:click={fragmentVisit} class="fragment">Fragment visit</a>
    <a href={'#'} on:click={nonExistentFragmentVisit} class="non-existent-fragment">Non-existent fragment visit</a>

    <a href={'#'} on:click={basicGetVisit} class="basic-get">Basic GET visit</a>
    <a href={'#'} on:click={fragmentGetVisit} class="fragment-get">Fragment GET visit</a>
    <a href={'#'} on:click={nonExistentFragmentGetVisit} class="non-existent-fragment-get"
      >Non-existent fragment GET visit</a
    >

    <div id="target">This is the element with id 'target'</div>
  </div>
</div>
