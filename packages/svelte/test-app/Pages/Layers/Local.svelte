<script lang="ts">
  let { note, errors }: { note: string; errors: Record<string, string> } = $props()
</script>

<div>Local layer</div>
<div id="local-note">{note}</div>
<div id="local-errors">{typeof errors}</div>
