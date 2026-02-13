<script lang="ts">
  let { greeting, timestamp }: { greeting?: string; timestamp?: number } = $props()
</script>

<div>
  <div id="target">This is Target</div>
  <div id="greeting">Greeting: {greeting ?? 'none'}</div>
  <div id="timestamp">Timestamp: {timestamp ?? 'none'}</div>
</div>
