<script lang="ts">
  import { getContext } from 'svelte'

  const withAppValue = getContext<string>('withAppValue') ?? 'not-injected'
</script>

<div>
  <h1 data-testid="with-app-title">SSR WithApp</h1>
  <p data-testid="with-app-value">Value: {withAppValue}</p>
</div>
