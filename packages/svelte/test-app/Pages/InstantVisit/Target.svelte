<script lang="ts">
  let { greeting, timestamp, auth }: { greeting?: string; timestamp?: number; auth?: { user: string } } = $props()
</script>

<div>
  <div id="target">This is Target</div>
  <div id="greeting">Greeting: {greeting ?? 'none'}</div>
  <div id="timestamp">Timestamp: {timestamp ?? 'none'}</div>
  <div id="auth">Auth: {auth?.user ?? 'none'}</div>
</div>
