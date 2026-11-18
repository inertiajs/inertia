<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let { rows, tags }: { rows: { name: string; stats?: string }[]; tags: string[] } = $props()
</script>

<p id="rows">{JSON.stringify(rows)}</p>
<p id="tags">{JSON.stringify(tags)}</p>

<button onclick={() => router.reload({ only: ['rows', 'rows.0.stats'] })}>Reload rows</button>
<button onclick={() => router.reload({ only: ['tags.1'] })}>Reload second tag</button>
