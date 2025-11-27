<script lang="ts">
  import { onMount } from 'svelte'
  import { getScrollableParent } from '@inertiajs/core'

  let overflowXHidden: HTMLDivElement = $state(null!)
  let overflowXScroll: HTMLDivElement = $state(null!)
  let overflowYAuto: HTMLDivElement = $state(null!)
  let overflowYAutoNoHeight: HTMLDivElement = $state(null!)
  let overflowXScrollOverflowYHidden: HTMLDivElement = $state(null!)
  let horizontalScrollCalc: HTMLDivElement = $state(null!)
  let verticalScrollMaxHeight: HTMLDivElement = $state(null!)
  let nestedScroll: HTMLDivElement = $state(null!)
  let overflowAutoNoConstraints: HTMLDivElement = $state(null!)
  let flexHorizontalCarousel: HTMLDivElement = $state(null!)
  let coercedAutoNoConstraint: HTMLDivElement = $state(null!)
  let displayContents: HTMLDivElement = $state(null!)
  let overflowClip: HTMLDivElement = $state(null!)
  let overflowOverlay: HTMLDivElement = $state(null!)
  let inlineWidthStyle: HTMLDivElement = $state(null!)
  let bothScrollDirections: HTMLDivElement = $state(null!)
  let overflowYAutoOverflowXVisible: HTMLDivElement = $state(null!)
  let overflowYAutoOverflowXClip: HTMLDivElement = $state(null!)
  let overflowXAutoOverflowYVisible: HTMLDivElement = $state(null!)
  let overflowXAutoOverflowYClip: HTMLDivElement = $state(null!)
  let overflowYAutoOverflowXHidden: HTMLDivElement = $state(null!)
  let overflowXAutoOverflowYHidden: HTMLDivElement = $state(null!)

  let results: Record<string, HTMLElement | null> = $state({})

  onMount(() => {
    Object.entries({
      overflowXHidden,
      overflowXScroll,
      overflowYAuto,
      overflowYAutoNoHeight,
      overflowXScrollOverflowYHidden,
      horizontalScrollCalc,
      verticalScrollMaxHeight,
      nestedScroll,
      overflowAutoNoConstraints,
      flexHorizontalCarousel,
      coercedAutoNoConstraint,
      displayContents,
      overflowClip,
      overflowOverlay,
      inlineWidthStyle,
      bothScrollDirections,
      overflowYAutoOverflowXVisible,
      overflowYAutoOverflowXClip,
      overflowXAutoOverflowYVisible,
      overflowXAutoOverflowYClip,
      overflowYAutoOverflowXHidden,
      overflowXAutoOverflowYHidden,
    }).forEach(([key, element]) => {
      results[key] = getScrollableParent(element)
    })
  })
</script>

<div style="padding: 20px">
  <h1>ScrollableParent Tests</h1>

  <div style="display: grid; gap: 20px; margin-top: 20px">
    <!-- overflow-x: hidden -->
    <div>
      <h3>overflow-x: hidden</h3>
      <div style="overflow-x: hidden; border: 2px solid red; padding: 10px">
        <div bind:this={overflowXHidden} data-testid="overflow-x-hidden">Test</div>
      </div>
      <p data-testid="result-overflow-x-hidden">{results.overflowXHidden?.tagName || 'null'}</p>
    </div>

    <!-- overflow-x: scroll -->
    <div>
      <h3>overflow-x: scroll</h3>
      <div
        style="overflow-x: scroll; width: 300px; border: 2px solid red; padding: 10px"
        data-testid="scroll-container-x"
      >
        <div bind:this={overflowXScroll} data-testid="overflow-x-scroll" style="width: 600px">Wide content</div>
      </div>
      <p data-testid="result-overflow-x-scroll">{results.overflowXScroll?.dataset?.testid || 'null'}</p>
    </div>

    <!-- overflow-y: auto with height -->
    <div>
      <h3>overflow-y: auto + height</h3>
      <div
        style="overflow-y: auto; height: 100px; border: 2px solid red; padding: 10px"
        data-testid="scroll-container-y"
      >
        <div bind:this={overflowYAuto} data-testid="overflow-y-auto">
          <p>Content</p>
          <p>Content</p>
          <p>Content</p>
        </div>
      </div>
      <p data-testid="result-overflow-y-auto">{results.overflowYAuto?.dataset?.testid || 'null'}</p>
    </div>

    <!-- overflow-y: auto no height -->
    <div>
      <h3>overflow-y: auto (no height)</h3>
      <div style="overflow-y: auto; border: 2px solid red; padding: 10px">
        <div bind:this={overflowYAutoNoHeight} data-testid="overflow-y-auto-no-height">Content</div>
      </div>
      <p data-testid="result-overflow-y-auto-no-height">{results.overflowYAutoNoHeight?.tagName || 'null'}</p>
    </div>

    <!-- overflow-x: scroll, overflow-y: hidden -->
    <div>
      <h3>overflow-x: scroll, overflow-y: hidden</h3>
      <div
        style="overflow-x: scroll; overflow-y: hidden; width: 300px; border: 2px solid red; padding: 10px"
        data-testid="scroll-container-x-y-hidden"
      >
        <div bind:this={overflowXScrollOverflowYHidden} data-testid="overflow-x-scroll-y-hidden" style="width: 600px">
          Wide content
        </div>
      </div>
      <p data-testid="result-overflow-x-scroll-y-hidden">
        {results.overflowXScrollOverflowYHidden?.dataset?.testid || 'null'}
      </p>
    </div>

    <!-- overflow-x: scroll + max-width -->
    <div>
      <h3>overflow-x: scroll + max-width</h3>
      <div
        style="overflow-x: scroll; max-width: 300px; border: 2px solid red; padding: 10px"
        data-testid="scroll-container-max-width"
      >
        <div bind:this={horizontalScrollCalc} data-testid="horizontal-scroll-calc" style="width: 600px">
          Wide content
        </div>
      </div>
      <p data-testid="result-horizontal-scroll-calc">{results.horizontalScrollCalc?.dataset?.testid || 'null'}</p>
    </div>

    <!-- overflow-y: auto + max-height -->
    <div>
      <h3>overflow-y: auto + max-height</h3>
      <div
        style="overflow-y: auto; max-height: 100px; border: 2px solid red; padding: 10px"
        data-testid="scroll-container-max-height"
      >
        <div bind:this={verticalScrollMaxHeight} data-testid="vertical-scroll-max-height">
          <p>Content</p>
          <p>Content</p>
          <p>Content</p>
        </div>
      </div>
      <p data-testid="result-vertical-scroll-max-height">
        {results.verticalScrollMaxHeight?.dataset?.testid || 'null'}
      </p>
    </div>

    <!-- Nested containers -->
    <div>
      <h3>Nested containers</h3>
      <div style="overflow-y: auto; height: 200px; border: 2px solid red; padding: 10px" data-testid="outer-scroll">
        <p>Outer</p>
        <div style="overflow-y: auto; height: 100px; border: 2px solid blue; padding: 10px" data-testid="inner-scroll">
          <div bind:this={nestedScroll} data-testid="nested-scroll">
            <p>Content</p>
            <p>Content</p>
            <p>Content</p>
            <p>Content</p>
            <p>Content</p>
          </div>
        </div>
      </div>
      <p data-testid="result-nested-scroll">{results.nestedScroll?.dataset?.testid || 'null'}</p>
    </div>

    <!-- overflow: auto (no constraints) -->
    <div>
      <h3>overflow: auto (no constraints)</h3>
      <div style="overflow: auto; border: 2px solid red; padding: 10px">
        <div bind:this={overflowAutoNoConstraints} data-testid="overflow-auto-no-constraints">Content</div>
      </div>
      <p data-testid="result-overflow-auto-no-constraints">{results.overflowAutoNoConstraints?.tagName || 'null'}</p>
    </div>

    <!-- Flex carousel -->
    <div>
      <h3>Flex horizontal carousel</h3>
      <div
        style="overflow-x: scroll; display: flex; gap: 10px; width: 300px; border: 2px solid red; padding: 10px"
        data-testid="flex-carousel"
      >
        <div
          bind:this={flexHorizontalCarousel}
          data-testid="flex-horizontal-carousel"
          style="min-width: 150px; height: 50px; background: lightblue"
        >
          Item
        </div>
        <div style="min-width: 150px; height: 50px; background: lightgreen">Item</div>
        <div style="min-width: 150px; height: 50px; background: lightcoral">Item</div>
      </div>
      <p data-testid="result-flex-horizontal-carousel">{results.flexHorizontalCarousel?.dataset?.testid || 'null'}</p>
    </div>

    <!-- Coerced auto -->
    <div>
      <h3>overflow-x: scroll (overflow-y coerced)</h3>
      <div
        style="overflow-x: scroll; display: flex; width: 300px; border: 2px solid red; padding: 10px"
        data-testid="coerced-auto"
      >
        <div bind:this={coercedAutoNoConstraint} data-testid="coerced-auto-no-constraint" style="min-width: 600px">
          Wide
        </div>
      </div>
      <p data-testid="result-coerced-auto-no-constraint">
        {results.coercedAutoNoConstraint?.dataset?.testid || 'null'}
      </p>
    </div>

    <!-- display: contents -->
    <div>
      <h3>display: contents (skip parent)</h3>
      <div
        style="overflow-y: auto; height: 100px; border: 2px solid red; padding: 10px"
        data-testid="scroll-container-skip-contents"
      >
        <div style="display: contents">
          <div bind:this={displayContents} data-testid="display-contents">
            <p>Content</p>
            <p>Content</p>
            <p>Content</p>
            <p>Content</p>
          </div>
        </div>
      </div>
      <p data-testid="result-display-contents">{results.displayContents?.dataset?.testid || 'null'}</p>
    </div>

    <!-- overflow: clip -->
    <div>
      <h3>overflow: clip</h3>
      <div style="overflow: clip; height: 100px; border: 2px solid red; padding: 10px">
        <div bind:this={overflowClip} data-testid="overflow-clip">
          <p>Content</p>
          <p>Content</p>
        </div>
      </div>
      <p data-testid="result-overflow-clip">{results.overflowClip?.tagName || 'null'}</p>
    </div>

    <!-- overflow: overlay -->
    <div>
      <h3>overflow: overlay</h3>
      <div
        style="overflow: overlay; height: 100px; border: 2px solid red; padding: 10px"
        data-testid="scroll-container-overlay"
      >
        <div bind:this={overflowOverlay} data-testid="overflow-overlay">
          <p>Content</p>
          <p>Content</p>
          <p>Content</p>
          <p>Content</p>
        </div>
      </div>
      <p data-testid="result-overflow-overlay">{results.overflowOverlay?.dataset?.testid || 'null'}</p>
    </div>

    <!-- Inline width -->
    <div>
      <h3>overflow-x: auto + inline width</h3>
      <div
        style="overflow-x: auto; width: 300px; border: 2px solid red; padding: 10px"
        data-testid="inline-width-container"
      >
        <div bind:this={inlineWidthStyle} data-testid="inline-width-style" style="width: 600px">Wide</div>
      </div>
      <p data-testid="result-inline-width-style">{results.inlineWidthStyle?.dataset?.testid || 'null'}</p>
    </div>

    <!-- Both scroll -->
    <div>
      <h3>overflow: scroll (both)</h3>
      <div
        style="overflow-x: scroll; overflow-y: scroll; width: 300px; height: 100px; border: 2px solid red; padding: 10px"
        data-testid="both-scroll"
      >
        <div bind:this={bothScrollDirections} data-testid="both-scroll-directions" style="width: 600px">
          <p>Wide and tall</p>
          <p>Content</p>
          <p>Content</p>
        </div>
      </div>
      <p data-testid="result-both-scroll-directions">{results.bothScrollDirections?.dataset?.testid || 'null'}</p>
    </div>

    <!-- overflow-y: auto + overflow-x: visible -->
    <div>
      <h3>overflow-y: auto + overflow-x: visible</h3>
      <div
        style="overflow-y: auto; overflow-x: visible; height: 100px; border: 2px solid red; padding: 10px"
        data-testid="overflow-y-auto-x-visible"
      >
        <div bind:this={overflowYAutoOverflowXVisible} data-testid="overflow-y-auto-overflow-x-visible">
          <p>Content</p>
          <p>Content</p>
          <p>Content</p>
        </div>
      </div>
      <p data-testid="result-overflow-y-auto-overflow-x-visible">
        {results.overflowYAutoOverflowXVisible?.dataset?.testid || 'null'}
      </p>
    </div>

    <!-- overflow-y: auto + overflow-x: clip -->
    <div>
      <h3>overflow-y: auto + overflow-x: clip</h3>
      <div
        style="overflow-y: auto; overflow-x: clip; height: 100px; border: 2px solid red; padding: 10px"
        data-testid="overflow-y-auto-x-clip"
      >
        <div bind:this={overflowYAutoOverflowXClip} data-testid="overflow-y-auto-overflow-x-clip">
          <p>Content</p>
          <p>Content</p>
          <p>Content</p>
        </div>
      </div>
      <p data-testid="result-overflow-y-auto-overflow-x-clip">
        {results.overflowYAutoOverflowXClip?.dataset?.testid || 'null'}
      </p>
    </div>

    <!-- overflow-x: auto + overflow-y: visible -->
    <div>
      <h3>overflow-x: auto + overflow-y: visible</h3>
      <div
        style="overflow-x: auto; overflow-y: visible; width: 300px; border: 2px solid red; padding: 10px"
        data-testid="overflow-x-auto-y-visible"
      >
        <div
          bind:this={overflowXAutoOverflowYVisible}
          data-testid="overflow-x-auto-overflow-y-visible"
          style="width: 600px"
        >
          Wide content
        </div>
      </div>
      <p data-testid="result-overflow-x-auto-overflow-y-visible">
        {results.overflowXAutoOverflowYVisible?.dataset?.testid || 'null'}
      </p>
    </div>

    <!-- overflow-x: auto + overflow-y: clip -->
    <div>
      <h3>overflow-x: auto + overflow-y: clip</h3>
      <div
        style="overflow-x: auto; overflow-y: clip; width: 300px; border: 2px solid red; padding: 10px"
        data-testid="overflow-x-auto-y-clip"
      >
        <div bind:this={overflowXAutoOverflowYClip} data-testid="overflow-x-auto-overflow-y-clip" style="width: 600px">
          Wide content
        </div>
      </div>
      <p data-testid="result-overflow-x-auto-overflow-y-clip">
        {results.overflowXAutoOverflowYClip?.dataset?.testid || 'null'}
      </p>
    </div>

    <!-- overflow-y: auto + overflow-x: hidden (no height) -->
    <div>
      <h3>overflow-y: auto + overflow-x: hidden (no height)</h3>
      <div style="overflow-y: auto; overflow-x: hidden; border: 2px solid red; padding: 10px">
        <div bind:this={overflowYAutoOverflowXHidden} data-testid="overflow-y-auto-overflow-x-hidden">Content</div>
      </div>
      <p data-testid="result-overflow-y-auto-overflow-x-hidden">
        {results.overflowYAutoOverflowXHidden?.tagName || 'null'}
      </p>
    </div>

    <!-- overflow-x: auto + overflow-y: hidden (no width) -->
    <div>
      <h3>overflow-x: auto + overflow-y: hidden (no width)</h3>
      <div style="overflow-x: auto; overflow-y: hidden; border: 2px solid red; padding: 10px">
        <div bind:this={overflowXAutoOverflowYHidden} data-testid="overflow-x-auto-overflow-y-hidden">Content</div>
      </div>
      <p data-testid="result-overflow-x-auto-overflow-y-hidden">
        {results.overflowXAutoOverflowYHidden?.tagName || 'null'}
      </p>
    </div>
  </div>
</div>
