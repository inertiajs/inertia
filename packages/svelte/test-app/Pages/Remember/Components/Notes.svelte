<script lang="ts">
  import { useRemember } from '@inertiajs/svelte'

  const notes = useRemember({ text: '' }, 'Users/Notes')
</script>

<label>
  Notes
  <input type="text" bind:value={notes.text} />
</label>
