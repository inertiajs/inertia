<script lang="ts">
  // Top-level await — requires the `async: true` Svelte compiler option
  const asyncMessage = await Promise.resolve('Hello from async SSR!')
</script>

<div>
  <h1 data-testid="async-ssr-title">Async SSR Page</h1>
  <p data-testid="async-result">Result: {asyncMessage}</p>
</div>
