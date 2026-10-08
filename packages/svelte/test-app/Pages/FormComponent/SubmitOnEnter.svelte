<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Submit On Enter</h1>

  <Form action="/dump/post" method="post">
    {#snippet children({ submit })}
      <textarea
        name="message"
        id="message"
        onkeydown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submit()
          }
        }}
      ></textarea>
    {/snippet}
  </Form>
</div>
