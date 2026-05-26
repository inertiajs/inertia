<script lang="ts">
  import { getContext } from 'svelte'

  const withAppValue = getContext<string>('withAppValue') ?? 'not-injected'
  const withAppLocale = getContext<string>('withAppLocale') ?? 'not-injected'
  const withAppComponent = getContext<string>('withAppComponent') ?? 'not-injected'
</script>

<div>
  <h1 data-testid="with-app-title">SSR WithApp</h1>
  <p data-testid="with-app-value">Value: {withAppValue}</p>
  <p data-testid="with-app-locale">Locale: {withAppLocale}</p>
  <p data-testid="with-app-component">Component: {withAppComponent}</p>
</div>
