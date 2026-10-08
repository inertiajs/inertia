<script lang="ts">
  let { big, nested } = $props()
</script>

<div>
  <h1 data-testid="ssr-title">SSR Big Integers</h1>

  <p data-testid="big">big: {big}</p>
  <p data-testid="big-type">type: {typeof big}</p>
  <p data-testid="nested">nested: {nested.deep.join(',')}</p>
</div>
