<script lang="ts">
  import { Link, useForm } from '@inertiajs/svelte'

  export let randomValue: number

  const form = useForm({})

  const submit = () => {
    form.post('/prefetch/redirect-back')
  }
</script>

<div>
  <p>
    Random Value: <span class="random-value">{randomValue}</span>
  </p>
  <button on:click={submit}>Submit Form</button>
  <Link href="/prefetch/test-page">Back to Test Page</Link>
</div>
