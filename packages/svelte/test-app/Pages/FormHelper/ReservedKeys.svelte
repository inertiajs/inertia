<script lang="ts">
import { useForm } from '@inertiajs/svelte'

// @ts-expect-error - Intentionally using reserved key to test validation
const form = useForm({ progress: 0 })
</script>

<div>
  <div id="form-created">Form created with progress value: {$form.progress}</div>
</div>
