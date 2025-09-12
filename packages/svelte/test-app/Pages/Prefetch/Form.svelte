<script lang="ts">
  import { Link, page, useForm } from '@inertiajs/svelte'

  const form = useForm({})

  const submitToSame = () => {
    $form.post('/prefetch/form')
  }

  const submitToOther = () => {
    $form.post('/prefetch/redirect-back')
  }
</script>

<div>
  <p>
    Random Value: <span class="random-value">{$page.props.randomValue}</span>
  </p>
  <button on:click={submitToSame}>Submit to Same URL</button>
  <button on:click={submitToOther}>Submit to Other URL</button>
  <Link href="/prefetch/test-page">Back to Test Page</Link>
</div>
